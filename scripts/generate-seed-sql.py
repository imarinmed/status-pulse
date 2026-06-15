#!/usr/bin/env python3
"""Generate seed SQL for Status Pulse from local git repos and coverage XML."""

import os
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

REPOS = {
    "rdu-ai-cmc-metrics-api": {
        "id": "735ef28e-24d6-4f59-b836-bb68788a2b25",
        "path": "/Users/wolfy/Developer/S9/innoit/alexion/rdu-ai-cmc-metrics-api",
        "coverage_path": "coverage.xml",
    },
    "rdu-ai-cmc-metrics-ui": {
        "id": "18b688c1-2e75-4314-b2ee-3e4a48d19602",
        "path": "/Users/wolfy/Developer/S9/innoit/alexion/rdu-ai-cmc-metrics-ui",
        "coverage_path": None,
    },
    "cmc-command-center": {
        "id": "9eaeafc3-6ae9-4668-b304-1ba258e76e6a",
        "path": "/Users/wolfy/Developer/S9/innoit/alexion/CMC-Command-Center",
        "coverage_path": None,
    },
}

BRANCH = "main"
MAX_COMMITS = 80


def escape_sql(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''").replace("\\", "\\\\") + "'"


def parse_git_commits(repo_path: str, repo_id: str, branch: str) -> list[dict]:
    """Parse recent commits including numstat for additions/deletions."""
    format_fields = [
        "%H",   # sha
        "%s",   # subject
        "%an",  # author name
        "%ae",  # author email
        "%ad",  # author date (iso-strict via --date)
    ]
    delim = "\x1f"
    format_str = delim.join(format_fields)
    cmd = [
        "git", "-C", repo_path,
        "log", branch,
        f"--pretty=format:{format_str}%x00",  # record separator
        "--date=iso-strict",
        "--max-count", str(MAX_COMMITS),
    ]
    log_output = subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL)

    # Use --numstat to map sha -> additions/deletions
    numstat_cmd = [
        "git", "-C", repo_path,
        "log", branch,
        "--pretty=format:%H%x00",  # sha then null, then numstat block, then blank line
        "--numstat",
        "--max-count", str(MAX_COMMITS),
    ]
    numstat_output = subprocess.check_output(numstat_cmd, text=True, stderr=subprocess.DEVNULL)

    # Build sha -> (additions, deletions)
    stats_by_sha: dict[str, tuple[int, int]] = {}
    current_sha: str | None = None
    for line in numstat_output.splitlines():
        if not line.strip():
            continue
        if line.endswith("\x00"):
            current_sha = line[:-1]
            continue
        if current_sha is None:
            continue
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        add_str, del_str = parts[0], parts[1]
        additions = int(add_str) if add_str.isdigit() else 0
        deletions = int(del_str) if del_str.isdigit() else 0
        existing = stats_by_sha.get(current_sha, (0, 0))
        stats_by_sha[current_sha] = (existing[0] + additions, existing[1] + deletions)

    commits: list[dict] = []
    for record in log_output.split("\x00"):
        record = record.strip()
        if not record:
            continue
        fields = record.split(delim)
        if len(fields) < 5:
            continue
        sha, subject, author_name, author_email, committed_at = fields[:5]
        additions, deletions = stats_by_sha.get(sha, (0, 0))
        commits.append({
            "repo_id": repo_id,
            "sha": sha,
            "message": subject,
            "author_name": author_name,
            "author_email": author_email,
            "committed_at": committed_at,
            "additions": additions,
            "deletions": deletions,
            "branch": branch,
        })
    return commits


def parse_coverage(repo_path: str, rel_path: str | None) -> dict | None:
    if not rel_path:
        return None
    cov_file = Path(repo_path) / rel_path
    if not cov_file.exists():
        return None
    tree = ET.parse(cov_file)
    root = tree.getroot()
    attrs = root.attrib
    ts_ms = int(attrs.get("timestamp", "0"))
    timestamp = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc).isoformat() if ts_ms else datetime.now(tz=timezone.utc).isoformat()
    return {
        "line_rate": float(attrs.get("line-rate", "0")),
        "lines_valid": int(attrs.get("lines-valid", "0")),
        "lines_covered": int(attrs.get("lines-covered", "0")),
        "branch_rate": float(attrs.get("branch-rate", "0")),
        "branches_valid": int(attrs.get("branches-valid", "0")),
        "branches_covered": int(attrs.get("branches-covered", "0")),
        "timestamp": timestamp,
        "source_path": str(cov_file),
    }


def main() -> None:
    out_path = Path(__file__).parent.parent / "supabase" / "seed_commits.sql"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    lines.append("-- Auto-generated seed SQL for Status Pulse")
    lines.append("-- Generated at: " + datetime.now(tz=timezone.utc).isoformat())
    lines.append("")
    lines.append("TRUNCATE TABLE commits, coverage_snapshots CASCADE;")
    lines.append("")

    coverage_rows: list[dict] = []

    for slug, meta in REPOS.items():
        repo_path = meta["path"]
        if not Path(repo_path).exists():
            print(f"Skipping missing repo: {repo_path}")
            continue
        print(f"Processing {slug} ...")
        commits = parse_git_commits(repo_path, meta["id"], BRANCH)
        lines.append(f"-- {slug}: {len(commits)} commits")
        if commits:
            lines.append("INSERT INTO commits (repo_id, sha, message, author_name, author_email, authored_at) VALUES")
            values = []
            for c in commits:
                values.append(
                    "("
                    f"{escape_sql(c['repo_id'])}, "
                    f"{escape_sql(c['sha'])}, "
                    f"{escape_sql(c['message'])}, "
                    f"{escape_sql(c['author_name'])}, "
                    f"{escape_sql(c['author_email'])}, "
                    f"{escape_sql(c['committed_at'])}"
                    ")"
                )
            lines.append(",".join(values) + ";")
        lines.append("")

        cov = parse_coverage(repo_path, meta.get("coverage_path"))
        if cov:
            coverage_rows.append({**cov, "repo_id": meta["id"], "slug": slug, "branch": BRANCH})

    if coverage_rows:
        lines.append("-- Coverage snapshots")
        lines.append("INSERT INTO coverage_snapshots (repo_id, sha, branch, total_lines, covered_lines, coverage_pct, collected_at) VALUES")
        values = []
        for row in coverage_rows:
            values.append(
                "("
                f"{escape_sql(row['repo_id'])}, "
                "NULL, "
                f"{escape_sql(row['branch'])}, "
                f"{row['lines_valid']}, "
                f"{row['lines_covered']}, "
                f"{row['line_rate'] * 100}, "
                f"{escape_sql(row['timestamp'])}"
                ")"
            )
        lines.append(",".join(values) + ";")
        lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()

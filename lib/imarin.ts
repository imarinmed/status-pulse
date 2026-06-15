/**
 * Identity helpers for highlighting Iñaki Marin's (imarin) contributions
 * across the Status Pulse dashboard.
 */

export const IMARIN_PROFILE = {
  handle: "imarin",
  displayName: "Iñaki Marin",
  email: "ignacio.marin@marem.io",
  initials: "IM",
  role: "Lead Engineer · CMC Metrics",
} as const;

export const FOCUS_REPO_SLUGS = [
  "rdu-ai-cmc-metrics-api",
  "rdu-ai-cmc-metrics-ui",
] as const;

export type FocusRepoSlug = (typeof FOCUS_REPO_SLUGS)[number];

export function isImarin(
  authorEmail: string | null | undefined,
  authorName?: string | null
): boolean {
  if (authorEmail && authorEmail.toLowerCase() === IMARIN_PROFILE.email) {
    return true;
  }
  if (authorName && /i[ñn]aki\s+marin/i.test(authorName)) {
    return true;
  }
  return false;
}

export function isFocusRepo(slug: string | null | undefined): slug is FocusRepoSlug {
  if (!slug) return false;
  return (FOCUS_REPO_SLUGS as readonly string[]).includes(slug);
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function commitTitle(message: string): string {
  return message.split("\n")[0] ?? message;
}

/**
 * Returns a stable calendar-day key (YYYY-MM-DD) in UTC for grouping
 * commit activity into discrete days.
 */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the ISO 8601 week key for a timestamp as `YYYY-Www`
 * (e.g. `2026-W12`). Uses UTC to avoid timezone drift between
 * server and client renders.
 */
export function isoWeekKey(iso: string): string {
  const date = new Date(
    Date.UTC(
      new Date(iso).getUTCFullYear(),
      new Date(iso).getUTCMonth(),
      new Date(iso).getUTCDate()
    )
  );
  // Shift to Thursday of the current ISO week so the year matches.
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const weekNo = Math.ceil(((date.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

/**
 * Returns the UTC Monday (start of ISO week) for a timestamp.
 * Useful for aligning week buckets onto a continuous timeline.
 */
export function isoWeekStart(iso: string): Date {
  const d = new Date(iso);
  const utc = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  const day = utc.getUTCDay() || 7; // Sun=0 -> 7
  utc.setUTCDate(utc.getUTCDate() - (day - 1));
  return utc;
}

/** Compact `MMM d` label for a Date (e.g. `Mar 4`). */
export function shortWeekLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ---------------------------------------------------------------------------
// Project Timeline configuration
// ---------------------------------------------------------------------------

/**
 * Canonical project identifiers used across the timeline. Stable strings —
 * safe to use as React keys and CSS class hooks.
 */
export type ProjectId = "project-a" | "project-b";

export interface ProjectGroup {
  id: ProjectId;
  /** Short tag rendered on the timeline row (e.g. "Project A"). */
  tag: string;
  /** Full title shown in the row header. */
  title: string;
  /** One-line subtitle describing scope or repos. */
  subtitle: string;
  /** Repo slugs that belong to this project. Used to filter commits. */
  repoSlugs: readonly string[];
}

export const PROJECT_GROUPS: readonly ProjectGroup[] = [
  {
    id: "project-a",
    tag: "Project A",
    title: "CMC Metrics",
    subtitle: "rdu-ai-cmc-metrics-api · rdu-ai-cmc-metrics-ui",
    repoSlugs: ["rdu-ai-cmc-metrics-api", "rdu-ai-cmc-metrics-ui"],
  },
  {
    id: "project-b",
    tag: "Project B",
    title: "CMC Command Center",
    subtitle: "cmc-command-center",
    repoSlugs: ["cmc-command-center"],
  },
] as const;

/**
 * Plausible milestone windows for imarin's contribution arc. Dates are
 * inclusive ISO date strings; the matching pass uses `start <= commit < end`
 * so an exclusive end-of-day (next day) is preferred.
 *
 * Milestones intentionally only cover Project A — the only project with
 * imarin authorship in the current dataset. Project B renders as a long
 * idle gap until imarin onboards onto that repo.
 */
export interface Milestone {
  id: string;
  projectId: ProjectId;
  label: string;
  /** Inclusive start (UTC, ISO 8601). */
  start: string;
  /** Exclusive end (UTC, ISO 8601). */
  end: string;
  /** Accent token used by the renderer to color the bar. */
  accent: "amber" | "blue" | "violet" | "emerald";
}

export const MILESTONES: readonly Milestone[] = [
  {
    id: "project-a-bootstrap",
    projectId: "project-a",
    label: "Bootstrap & Phase F hardening",
    start: "2026-04-17T00:00:00Z",
    end: "2026-04-19T00:00:00Z",
    accent: "amber",
  },
  {
    id: "project-a-qa-docs",
    projectId: "project-a",
    label: "QA contracts & documentation",
    start: "2026-05-25T00:00:00Z",
    end: "2026-05-26T00:00:00Z",
    accent: "blue",
  },
] as const;

/**
 * Explicitly annotated idle ranges. Anything not covered here but still
 * gap-like (> IDLE_GAP_THRESHOLD_DAYS without an imarin commit) is rendered
 * as an unlabeled "Idle" segment by `buildProjectTimeline`.
 */
export interface IdleGap {
  id: string;
  projectId: ProjectId;
  reason: string;
  start: string;
  end: string;
}

export const IDLE_GAPS: readonly IdleGap[] = [
  {
    id: "project-a-mid-cycle-pause",
    projectId: "project-a",
    reason: "Awaiting infra access · client review window",
    start: "2026-04-19T00:00:00Z",
    end: "2026-05-25T00:00:00Z",
  },
  {
    id: "project-b-pre-onboarding",
    projectId: "project-b",
    reason: "Awaiting onboarding to cmc-command-center",
    start: "2026-04-17T00:00:00Z",
    end: "2026-05-26T00:00:00Z",
  },
] as const;

/** Commits separated by more than this many days form a new "Other work" segment. */
export const IDLE_GAP_THRESHOLD_DAYS = 5;

// ---------------------------------------------------------------------------
// Timeline segment builder
// ---------------------------------------------------------------------------

export type TimelineSegmentKind = "milestone" | "work" | "idle";

export interface TimelineCommit {
  sha: string;
  message: string;
  authoredAt: string;
  additions: number;
  deletions: number;
  repoSlug: string;
}

export interface TimelineSegment {
  /** Stable id, unique within the project row. */
  id: string;
  projectId: ProjectId;
  kind: TimelineSegmentKind;
  label: string;
  /** UTC ISO start (inclusive). */
  startIso: string;
  /** UTC ISO end (exclusive). */
  endIso: string;
  /** Lines of code (additions + deletions) summed over included commits. */
  loc: number;
  /** Number of imarin commits in the segment. */
  commits: number;
  /** First-line message of the largest commit in the segment, if any. */
  topMessage: string | null;
  /** Optional explanation used for idle segments. */
  reason: string | null;
  /** Accent token for milestone/work segments; null for idle. */
  accent: "amber" | "blue" | "violet" | "emerald" | null;
}

export interface ProjectTimelineRow {
  project: ProjectGroup;
  segments: TimelineSegment[];
  /** Total LOC across all imarin commits in this project. */
  totalLoc: number;
  /** Total imarin commits in this project. */
  totalCommits: number;
}

export interface ProjectTimelineModel {
  /** Inclusive start of the timeline x-axis (UTC). */
  startIso: string;
  /** Exclusive end of the timeline x-axis (UTC). */
  endIso: string;
  rows: ProjectTimelineRow[];
}

function dayMs(): number {
  return 86_400_000;
}

function startOfUtcDay(iso: string): Date {
  const d = new Date(iso);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * dayMs()).toISOString();
}

function pickTopMessage(commits: TimelineCommit[]): string | null {
  if (commits.length === 0) return null;
  const top = commits.reduce((best, c) => {
    const bestLoc = best.additions + best.deletions;
    const curLoc = c.additions + c.deletions;
    return curLoc > bestLoc ? c : best;
  }, commits[0]);
  return commitTitle(top.message);
}

function sumLoc(commits: TimelineCommit[]): number {
  return commits.reduce((s, c) => s + c.additions + c.deletions, 0);
}

/**
 * Build the project timeline model from a list of imarin commits and the
 * full repo set. Commits are partitioned per project, then assigned to
 * milestones (if any) and grouped into contiguous "work" segments separated
 * by gaps > IDLE_GAP_THRESHOLD_DAYS. Explicit IDLE_GAPS are always rendered;
 * implicit gaps are emitted as unlabeled idle segments.
 *
 * The x-axis spans the union of all imarin commits, explicit milestones,
 * and explicit idle gaps so every defined range is visible even when the
 * dataset is sparse.
 */
export function buildProjectTimeline(
  commits: ReadonlyArray<TimelineCommit>
): ProjectTimelineModel {
  // Compute the global timeline window.
  const candidates: number[] = [];
  for (const c of commits) candidates.push(new Date(c.authoredAt).getTime());
  for (const m of MILESTONES) {
    candidates.push(new Date(m.start).getTime());
    candidates.push(new Date(m.end).getTime());
  }
  for (const g of IDLE_GAPS) {
    candidates.push(new Date(g.start).getTime());
    candidates.push(new Date(g.end).getTime());
  }

  const nowMs = Date.now();
  const minMs = candidates.length > 0 ? Math.min(...candidates) : nowMs;
  const maxMs = candidates.length > 0 ? Math.max(...candidates) : nowMs;

  // Pad one day on each side so segments at the edges read clearly.
  const startIso = new Date(minMs - dayMs()).toISOString();
  const endIso = new Date(maxMs + dayMs()).toISOString();

  const rows: ProjectTimelineRow[] = PROJECT_GROUPS.map((project) => {
    const projectCommits = commits
      .filter((c) => project.repoSlugs.includes(c.repoSlug))
      .slice()
      .sort((a, b) =>
        a.authoredAt < b.authoredAt ? -1 : a.authoredAt > b.authoredAt ? 1 : 0
      );

    const projectMilestones = MILESTONES.filter(
      (m) => m.projectId === project.id
    );
    const projectIdleGaps = IDLE_GAPS.filter(
      (g) => g.projectId === project.id
    );

    const usedShas = new Set<string>();
    const segments: TimelineSegment[] = [];

    // 1. Milestone segments — each one collects commits whose authored_at
    //    falls within [start, end). Empty milestones are still rendered so
    //    the plan is visible even before commits land.
    for (const milestone of projectMilestones) {
      const startTs = new Date(milestone.start).getTime();
      const endTs = new Date(milestone.end).getTime();
      const inside = projectCommits.filter((c) => {
        const t = new Date(c.authoredAt).getTime();
        return t >= startTs && t < endTs;
      });
      for (const c of inside) usedShas.add(c.sha);

      segments.push({
        id: milestone.id,
        projectId: project.id,
        kind: "milestone",
        label: milestone.label,
        startIso: milestone.start,
        endIso: milestone.end,
        loc: sumLoc(inside),
        commits: inside.length,
        topMessage: pickTopMessage(inside),
        reason: null,
        accent: milestone.accent,
      });
    }

    // 2. "Other work" segments — group remaining commits into contiguous
    //    runs separated by gaps > IDLE_GAP_THRESHOLD_DAYS.
    const leftover = projectCommits.filter((c) => !usedShas.has(c.sha));
    let currentRun: TimelineCommit[] = [];
    const flushRun = (run: TimelineCommit[]) => {
      if (run.length === 0) return;
      const first = run[0];
      const last = run[run.length - 1];
      // Pad by half a day so single-commit runs are visible.
      const startIsoRun = addDays(first.authoredAt, -0.25);
      const endIsoRun = addDays(last.authoredAt, 0.25);
      segments.push({
        id: `${project.id}-other-${first.sha.slice(0, 7)}`,
        projectId: project.id,
        kind: "work",
        label: "Other work",
        startIso: startIsoRun,
        endIso: endIsoRun,
        loc: sumLoc(run),
        commits: run.length,
        topMessage: pickTopMessage(run),
        reason: null,
        accent: "emerald",
      });
    };

    for (const c of leftover) {
      if (currentRun.length === 0) {
        currentRun.push(c);
        continue;
      }
      const prev = currentRun[currentRun.length - 1];
      const gap =
        (new Date(c.authoredAt).getTime() -
          new Date(prev.authoredAt).getTime()) /
        dayMs();
      if (gap > IDLE_GAP_THRESHOLD_DAYS) {
        flushRun(currentRun);
        currentRun = [c];
      } else {
        currentRun.push(c);
      }
    }
    flushRun(currentRun);

    // 3. Explicit idle gaps. These render below/over the work bars in a
    //    distinct gray, with a human-readable reason.
    for (const gap of projectIdleGaps) {
      segments.push({
        id: gap.id,
        projectId: project.id,
        kind: "idle",
        label: gap.reason,
        startIso: gap.start,
        endIso: gap.end,
        loc: 0,
        commits: 0,
        topMessage: null,
        reason: gap.reason,
        accent: null,
      });
    }

    // Sort segments by start, then idle below work for stable z-ordering.
    segments.sort((a, b) => {
      if (a.startIso === b.startIso) {
        if (a.kind === b.kind) return 0;
        // idle first so work paints on top
        if (a.kind === "idle") return -1;
        if (b.kind === "idle") return 1;
        return 0;
      }
      return a.startIso < b.startIso ? -1 : 1;
    });

    return {
      project,
      segments,
      totalLoc: sumLoc(projectCommits),
      totalCommits: projectCommits.length,
    };
  });

  return { startIso, endIso, rows };
}

/**
 * Convert a (segment) iso pair to fractional [0, 1] positions along the
 * timeline. Useful for SVG/CSS layout. Returns null if the segment lies
 * fully outside the window.
 */
export function segmentToPositions(
  segment: { startIso: string; endIso: string },
  windowStartIso: string,
  windowEndIso: string
): { left: number; width: number } | null {
  const windowStart = new Date(windowStartIso).getTime();
  const windowEnd = new Date(windowEndIso).getTime();
  const span = windowEnd - windowStart;
  if (span <= 0) return null;

  const segStart = Math.max(new Date(segment.startIso).getTime(), windowStart);
  const segEnd = Math.min(new Date(segment.endIso).getTime(), windowEnd);
  if (segEnd <= segStart) return null;

  return {
    left: (segStart - windowStart) / span,
    width: (segEnd - segStart) / span,
  };
}

/** UTC `MMM d` label, optionally with year if `withYear` is set. */
export function shortDayLabel(iso: string, withYear = false): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

/** Returns evenly spaced UTC week-start ticks across the timeline window. */
export function buildTimelineTicks(
  startIso: string,
  endIso: string,
  maxTicks = 8
): { iso: string; label: string }[] {
  const startTs = startOfUtcDay(startIso).getTime();
  const endTs = startOfUtcDay(endIso).getTime();
  const span = endTs - startTs;
  if (span <= 0) return [];

  const days = Math.max(1, Math.round(span / dayMs()));
  // Aim for ~maxTicks ticks; round step up to the nearest 3-day multiple
  // so the labels read cleanly.
  const rawStep = Math.max(1, Math.ceil(days / maxTicks));
  const step = Math.ceil(rawStep / 3) * 3;

  const ticks: { iso: string; label: string }[] = [];
  for (let cursor = startTs; cursor <= endTs; cursor += step * dayMs()) {
    const iso = new Date(cursor).toISOString();
    ticks.push({ iso, label: shortDayLabel(iso) });
  }
  // Always include the last tick so the right edge is labeled.
  const lastIso = new Date(endTs).toISOString();
  const lastLabel = shortDayLabel(lastIso);
  if (
    ticks.length === 0 ||
    ticks[ticks.length - 1].label !== lastLabel
  ) {
    ticks.push({ iso: lastIso, label: lastLabel });
  }
  return ticks;
}

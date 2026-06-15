import { createClient } from "@/lib/supabase/server";
import {
  FOCUS_REPO_SLUGS,
  IMARIN_PROFILE,
  isImarin,
} from "@/lib/imarin";
import { IdentityHero } from "@/components/dashboard/identity-hero";
import { ImpactMetric } from "@/components/dashboard/impact-metric";
import { RepoFocusCard } from "@/components/dashboard/repo-focus-card";
import {
  ActivityTimeline,
  type CommitRowData,
} from "@/components/dashboard/recent-commits-table";

export const revalidate = 60;

type RepoJoin =
  | { name: string | null; slug: string | null }
  | Array<{ name: string | null; slug: string | null }>
  | null;

function pickRepo(repos: RepoJoin): { name: string; slug: string } {
  if (!repos) return { name: "—", slug: "—" };
  const first = Array.isArray(repos) ? repos[0] : repos;
  return {
    name: first?.name ?? "—",
    slug: first?.slug ?? "—",
  };
}

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: repos },
    { data: rawRecentCommits },
    { data: rawImarinCommits },
    { data: coverageRows },
  ] = await Promise.all([
    supabase.from("repos").select("id, name, slug"),
    supabase
      .from("commits")
      .select(
        "sha, message, author_name, author_email, authored_at, repos(name, slug)"
      )
      .order("authored_at", { ascending: false })
      .limit(15),
    supabase
      .from("commits")
      .select(
        "sha, message, author_name, author_email, authored_at, repos(name, slug)"
      )
      .eq("author_email", IMARIN_PROFILE.email)
      .order("authored_at", { ascending: false })
      .limit(12),
    supabase
      .from("coverage_snapshots")
      .select(
        "coverage_pct, branch, collected_at, repo_id, repos(name, slug)"
      )
      .order("collected_at", { ascending: false }),
  ]);

  const repoList = repos ?? [];

  // Per-repo stats: total commits, imarin commits, latest imarin commit.
  const repoStats = await Promise.all(
    repoList.map(async (repo) => {
      const [
        { count: totalCount },
        { count: imarinCount },
        { data: latestImarin },
      ] = await Promise.all([
        supabase
          .from("commits")
          .select("*", { count: "exact", head: true })
          .eq("repo_id", repo.id),
        supabase
          .from("commits")
          .select("*", { count: "exact", head: true })
          .eq("repo_id", repo.id)
          .eq("author_email", IMARIN_PROFILE.email),
        supabase
          .from("commits")
          .select("sha, message, authored_at")
          .eq("repo_id", repo.id)
          .eq("author_email", IMARIN_PROFILE.email)
          .order("authored_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      return {
        id: repo.id,
        name: repo.name,
        slug: repo.slug,
        totalCommits: totalCount ?? 0,
        imarinCommits: imarinCount ?? 0,
        latestImarinCommit: latestImarin
          ? {
              sha: latestImarin.sha,
              message: latestImarin.message,
              authoredAt: latestImarin.authored_at,
            }
          : null,
      };
    })
  );

  // Aggregates for the impact metric row.
  const totalCommits = repoStats.reduce((sum, r) => sum + r.totalCommits, 0);
  const imarinTotal = repoStats.reduce((sum, r) => sum + r.imarinCommits, 0);
  const reposImarinTouched = repoStats.filter((r) => r.imarinCommits > 0)
    .length;
  const sharePct =
    totalCommits > 0 ? (imarinTotal / totalCommits) * 100 : 0;

  // Per-repo coverage lookup (latest snapshot per repo).
  const coverageByRepoId = new Map<string, number | null>();
  for (const row of coverageRows ?? []) {
    if (!row.repo_id || coverageByRepoId.has(row.repo_id)) continue;
    coverageByRepoId.set(row.repo_id, row.coverage_pct);
  }

  // Surface the latest API coverage snapshot for the top metric row.
  const apiRepo = repoStats.find((r) => r.slug === "rdu-ai-cmc-metrics-api");
  const apiCoveragePct = apiRepo
    ? coverageByRepoId.get(apiRepo.id) ?? null
    : null;

  // Focus repos in canonical order (API first, UI second).
  const focusRepoStats = FOCUS_REPO_SLUGS.map((slug) =>
    repoStats.find((r) => r.slug === slug)
  ).filter((r): r is (typeof repoStats)[number] => Boolean(r));

  // Activity timeline = recent commits across all repos with @imarin
  // commits interleaved, deduplicated by sha, sorted newest first.
  const allRecent: CommitRowData[] = [
    ...(rawImarinCommits ?? []),
    ...(rawRecentCommits ?? []),
  ].map((c) => {
    const repo = pickRepo(c.repos as RepoJoin);
    return {
      sha: c.sha,
      message: c.message,
      authorName: c.author_name ?? "Unknown",
      authorEmail: c.author_email,
      authoredAt: c.authored_at,
      repoName: repo.name,
      repoSlug: repo.slug,
    };
  });

  const seen = new Set<string>();
  const timelineCommits = allRecent
    .filter((c) => {
      if (seen.has(c.sha)) return false;
      seen.add(c.sha);
      return true;
    })
    .sort((a, b) => (a.authoredAt < b.authoredAt ? 1 : -1))
    .slice(0, 14);

  const timelineImarinCount = timelineCommits.filter((c) =>
    isImarin(c.authorEmail, c.authorName)
  ).length;

  const tagline = `Driving ${reposImarinTouched} of ${repoList.length} tracked repositories — ${imarinTotal} commits, ${sharePct.toFixed(1)}% of the total volume across the platform.`;

  return (
    <main className="min-h-screen px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Top bar */}
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-block size-1.5 rounded-full bg-amber-500" />
            Status Pulse
          </div>
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            Contributor Impact Report
          </h1>
        </header>

        {/* 1. Identity hero */}
        <IdentityHero tagline={tagline} />

        {/* 2. Impact metric row */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ImpactMetric
            label="Commits by @imarin"
            value={imarinTotal.toLocaleString()}
            caption={`of ${totalCommits.toLocaleString()} tracked`}
            accent
          />
          <ImpactMetric
            label="Repositories driven"
            value={reposImarinTouched.toString()}
            caption={`of ${repoList.length} tracked`}
          />
          <ImpactMetric
            label="Share of commits"
            value={`${sharePct.toFixed(1)}%`}
            caption="across all repositories"
          />
          <ImpactMetric
            label="API coverage"
            value={apiCoveragePct !== null ? `${apiCoveragePct.toFixed(2)}%` : "—"}
            caption="rdu-ai-cmc-metrics-api"
          />
        </section>

        {/* 3. Two repo deep-dive cards */}
        {focusRepoStats.length > 0 && (
          <section className="grid gap-4 lg:grid-cols-2">
            {focusRepoStats.map((repo) => (
              <RepoFocusCard
                key={repo.id}
                name={repo.name}
                slug={repo.slug}
                totalCommits={repo.totalCommits}
                imarinCommits={repo.imarinCommits}
                coveragePct={coverageByRepoId.get(repo.id) ?? null}
                latestImarinCommit={repo.latestImarinCommit}
              />
            ))}
          </section>
        )}

        {/* 4. Activity timeline */}
        <ActivityTimeline commits={timelineCommits} />

        {/* 5. Footer */}
        <footer className="pt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Status Pulse · @{IMARIN_PROFILE.handle} spotlight ·{" "}
          {timelineImarinCount}/{timelineCommits.length} highlighted ·
          revalidates every {revalidate}s
        </footer>
      </div>
    </main>
  );
}

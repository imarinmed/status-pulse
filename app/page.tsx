import { createClient } from "@/lib/supabase/server";
import {
  FOCUS_REPO_SLUGS,
  IMARIN_PROFILE,
  buildProjectTimeline,
  dayKey,
  isoWeekKey,
  type TimelineCommit,
} from "@/lib/imarin";
import { IdentityHero } from "@/components/dashboard/identity-hero";
import { ImpactMetric } from "@/components/dashboard/impact-metric";
import { RepoFocusCard } from "@/components/dashboard/repo-focus-card";
import {
  ActivityTimeline,
  type CommitRowData,
} from "@/components/dashboard/recent-commits-table";
import { ProjectTimeline } from "@/components/dashboard/project-timeline";

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
    { data: rawImarinCommits },
    { data: coverageRows },
  ] = await Promise.all([
    supabase.from("repos").select("id, name, slug"),
    supabase
      .from("commits")
      .select(
        "sha, message, author_name, author_email, authored_at, additions, deletions, repos(name, slug)"
      )
      .eq("author_email", IMARIN_PROFILE.email)
      .order("authored_at", { ascending: false }),
    supabase
      .from("coverage_snapshots")
      .select(
        "coverage_pct, branch, collected_at, repo_id, repos(name, slug)"
      )
      .order("collected_at", { ascending: false }),
  ]);

  const repoList = repos ?? [];
  const imarinCommits = rawImarinCommits ?? [];

  // --- Top-line metrics (LOC / pushes / active days / active weeks) ---
  const totalLoc = imarinCommits.reduce(
    (sum, c) => sum + (c.additions ?? 0) + (c.deletions ?? 0),
    0
  );
  const totalPushes = imarinCommits.length;

  const dayBuckets = new Set<string>();
  const weekBuckets = new Set<string>();
  for (const c of imarinCommits) {
    dayBuckets.add(dayKey(c.authored_at));
    weekBuckets.add(isoWeekKey(c.authored_at));
  }
  const activeDays = dayBuckets.size;
  const activeWeeks = weekBuckets.size;

  // --- Per-repo stats: total commits, imarin commits, latest imarin commit. ---
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

  // Per-repo coverage lookup (latest snapshot per repo).
  const coverageByRepoId = new Map<string, number | null>();
  for (const row of coverageRows ?? []) {
    if (!row.repo_id || coverageByRepoId.has(row.repo_id)) continue;
    coverageByRepoId.set(row.repo_id, row.coverage_pct);
  }

  // Focus repos in canonical order (API first, UI second).
  const focusRepoStats = FOCUS_REPO_SLUGS.map((slug) =>
    repoStats.find((r) => r.slug === slug)
  ).filter((r): r is (typeof repoStats)[number] => Boolean(r));

  const totalTrackedCommits = repoStats.reduce(
    (sum, r) => sum + r.totalCommits,
    0
  );
  const reposImarinTouched = repoStats.filter((r) => r.imarinCommits > 0)
    .length;
  const sharePct =
    totalTrackedCommits > 0 ? (totalPushes / totalTrackedCommits) * 100 : 0;

  // Project timeline (Gantt) — group imarin commits by their repo slug and
  // feed PROJECT_GROUPS / MILESTONES / IDLE_GAPS through buildProjectTimeline.
  const timelineInput: TimelineCommit[] = imarinCommits
    .map((c) => {
      const repo = pickRepo(c.repos as RepoJoin);
      if (repo.slug === "—") return null;
      return {
        sha: c.sha,
        message: c.message,
        authoredAt: c.authored_at,
        additions: c.additions ?? 0,
        deletions: c.deletions ?? 0,
        repoSlug: repo.slug,
      } satisfies TimelineCommit;
    })
    .filter((c): c is TimelineCommit => c !== null);

  const timelineModel = buildProjectTimeline(timelineInput);

  // Activity timeline = most recent imarin commits only.
  const timelineCommits: CommitRowData[] = imarinCommits
    .slice(0, 14)
    .map((c) => {
      const repo = pickRepo(c.repos as RepoJoin);
      return {
        sha: c.sha,
        message: c.message,
        authorName: c.author_name ?? IMARIN_PROFILE.displayName,
        authorEmail: c.author_email,
        authoredAt: c.authored_at,
        repoName: repo.name,
        repoSlug: repo.slug,
        additions: c.additions ?? 0,
        deletions: c.deletions ?? 0,
      };
    });

  const tagline = `Driving ${reposImarinTouched} of ${repoList.length} tracked repositories — ${totalPushes.toLocaleString()} pushes, ${totalLoc.toLocaleString()} LOC changed, ${sharePct.toFixed(1)}% of platform commit volume.`;

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

        {/* 2. Impact metric row — LOC / pushes / active days / active weeks */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ImpactMetric
            label="LOC changed"
            value={totalLoc.toLocaleString()}
            caption="additions + deletions"
            accent
          />
          <ImpactMetric
            label="Pushes"
            value={totalPushes.toLocaleString()}
            caption={`across ${reposImarinTouched} repositories`}
          />
          <ImpactMetric
            label="Active days"
            value={activeDays.toLocaleString()}
            caption="distinct UTC days with commits"
          />
          <ImpactMetric
            label="Active weeks"
            value={activeWeeks.toLocaleString()}
            caption="distinct ISO weeks with commits"
          />
        </section>

        {/* 3. Project timeline (Gantt) */}
        <ProjectTimeline model={timelineModel} />

        {/* 4. Two repo deep-dive cards */}
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

        {/* 5. Activity timeline (imarin only) */}
        <ActivityTimeline commits={timelineCommits} />

        {/* 6. Footer */}
        <footer className="pt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Status Pulse · @{IMARIN_PROFILE.handle} spotlight ·{" "}
          {timelineCommits.length} recent commits · revalidates every{" "}
          {revalidate}s
        </footer>
      </div>
    </main>
  );
}

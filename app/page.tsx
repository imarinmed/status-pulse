import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import {
  FOCUS_REPO_SLUGS,
  IMARIN_PROFILE,
  isFocusRepo,
  isImarin,
} from "@/lib/imarin";
import { ImarinHero } from "@/components/dashboard/imarin-hero";
import { RepoFocusCard } from "@/components/dashboard/repo-focus-card";
import {
  RecentCommitsTable,
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

  const [{ data: repos }, { data: rawRecentCommits }, { data: coverageRows }] =
    await Promise.all([
      supabase.from("repos").select("id, name, slug"),
      supabase
        .from("commits")
        .select("sha, message, author_name, author_email, authored_at, repos(name, slug)")
        .order("authored_at", { ascending: false })
        .limit(12),
      supabase
        .from("coverage_snapshots")
        .select(
          "coverage_pct, covered_lines, total_lines, branch, collected_at, repo_id, repos(name, slug)"
        )
        .order("collected_at", { ascending: false }),
    ]);

  const repoList = repos ?? [];

  const repoStats = await Promise.all(
    repoList.map(async (repo) => {
      const [{ count: totalCount }, { count: imarinCount }, { data: latestImarin }] =
        await Promise.all([
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
            .select("message, authored_at")
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
              message: latestImarin.message,
              authoredAt: latestImarin.authored_at,
            }
          : null,
      };
    })
  );

  const totalCommits = repoStats.reduce((sum, r) => sum + r.totalCommits, 0);
  const imarinTotal = repoStats.reduce((sum, r) => sum + r.imarinCommits, 0);
  const reposImarinTouched = repoStats.filter((r) => r.imarinCommits > 0).length;

  // Pick the most recent imarin commit overall for the hero
  const latestImarinOverall = repoStats
    .map((r) =>
      r.latestImarinCommit
        ? {
            ...r.latestImarinCommit,
            repoName: r.name,
          }
        : null
    )
    .filter((x): x is { message: string; authoredAt: string; repoName: string } =>
      x !== null
    )
    .sort((a, b) => (a.authoredAt < b.authoredAt ? 1 : -1))[0];

  // Coverage: build per-repo lookup of the most recent snapshot
  const coverageByRepoId = new Map<
    string,
    {
      coveragePct: number | null;
      coveredLines: number | null;
      totalLines: number | null;
      branch: string | null;
      repoName: string | null;
      repoSlug: string | null;
    }
  >();
  for (const row of coverageRows ?? []) {
    if (!row.repo_id || coverageByRepoId.has(row.repo_id)) continue;
    const repo = pickRepo(row.repos as RepoJoin);
    coverageByRepoId.set(row.repo_id, {
      coveragePct: row.coverage_pct,
      coveredLines: row.covered_lines,
      totalLines: row.total_lines,
      branch: row.branch,
      repoName: repo.name,
      repoSlug: repo.slug,
    });
  }
  const primaryCoverage = (coverageRows ?? [])[0]
    ? {
        coveragePct: coverageRows![0].coverage_pct,
        coverageRepo: pickRepo(coverageRows![0].repos as RepoJoin).name,
      }
    : { coveragePct: null, coverageRepo: null };

  const recentCommits: CommitRowData[] = (rawRecentCommits ?? []).map((c) => {
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

  // Sort focus repos in canonical order (API first, UI second)
  const focusRepoStats = FOCUS_REPO_SLUGS.map((slug) =>
    repoStats.find((r) => r.slug === slug)
  ).filter((r): r is (typeof repoStats)[number] => Boolean(r));

  const otherRepos = repoStats.filter((r) => !isFocusRepo(r.slug));

  return (
    <main className="min-h-screen px-6 py-10 md:px-12 md:py-14">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Top bar */}
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_12px] shadow-amber-400/60" />
              <p className="text-xs uppercase tracking-[0.22em] text-amber-300/80">
                Status Pulse · imarin spotlight
              </p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Status Pulse
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Multi-tenant project status dashboard for InnoIT client verticals,
              built and operated by <span className="text-amber-200 font-medium">{IMARIN_PROFILE.displayName}</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">tenant · innoit</Badge>
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-200">
              client · Alexion (AstraZeneca)
            </Badge>
            <Badge variant="outline">{repoList.length} repositories</Badge>
            <Badge variant="outline">{totalCommits} commits</Badge>
          </div>
        </header>

        <ImarinHero
          totalCommits={totalCommits}
          imarinCommits={imarinTotal}
          reposTouched={reposImarinTouched}
          latestCommitAt={latestImarinOverall?.authoredAt ?? null}
          latestCommitMessage={latestImarinOverall?.message ?? null}
          latestCommitRepo={latestImarinOverall?.repoName ?? null}
          coveragePct={primaryCoverage.coveragePct}
          coverageRepo={primaryCoverage.coverageRepo}
        />

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Focus repositories
              </h2>
              <p className="text-sm text-muted-foreground">
                Two services imarin actively maintains across the CMC Metrics
                platform.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-200"
            >
              core deliverables
            </Badge>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {focusRepoStats.map((repo, idx) => {
              const cov = coverageByRepoId.get(repo.id);
              return (
                <RepoFocusCard
                  key={repo.id}
                  name={repo.name}
                  slug={repo.slug}
                  totalCommits={repo.totalCommits}
                  imarinCommits={repo.imarinCommits}
                  coveragePct={cov?.coveragePct ?? null}
                  coveredLines={cov?.coveredLines ?? null}
                  totalLines={cov?.totalLines ?? null}
                  branch={cov?.branch ?? null}
                  latestImarinCommit={repo.latestImarinCommit}
                  accent={idx === 0 ? "amber" : "violet"}
                />
              );
            })}
          </div>
        </section>

        {otherRepos.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Other tracked repositories
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="rounded-xl border border-border/70 bg-background/50 p-4"
                >
                  <p className="text-sm font-medium">{repo.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {repo.slug}
                  </p>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">commits</span>
                    <span className="font-mono font-semibold">{repo.totalCommits}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">imarin</span>
                    <span className="font-mono font-semibold text-amber-200">
                      {repo.imarinCommits}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <RecentCommitsTable commits={recentCommits} />

        <footer className="border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>
            Highlighting{" "}
            <span className="text-amber-200 font-medium">{IMARIN_PROFILE.displayName}</span>{" "}
            ·{" "}
            <span className="font-mono">{IMARIN_PROFILE.email}</span> ·{" "}
            {imarinTotal} of {totalCommits} commits ·{" "}
            {((imarinTotal / Math.max(totalCommits, 1)) * 100).toFixed(1)}% share
            · last sync revalidates every {revalidate}s.
          </p>
        </footer>
      </div>
    </main>
  );
}

// Static reference to keep tree-shaking honest with the helper used inside
// the recent commits table.
void isImarin;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const { data: repos } = await supabase.from("repos").select("id, name, slug");

  const { data: recentCommits } = await supabase
    .from("commits")
    .select("sha, message, author_name, authored_at, repos(name, slug)")
    .order("authored_at", { ascending: false })
    .limit(10);

  const { data: coverage } = await supabase
    .from("coverage_snapshots")
    .select("coverage_pct, covered_lines, total_lines, branch, collected_at, repos(name, slug)")
    .order("collected_at", { ascending: false })
    .limit(1)
    .single();

  const repoStats = await Promise.all(
    (repos ?? []).map(async (repo) => {
      const { count } = await supabase
        .from("commits")
        .select("*", { count: "exact", head: true })
        .eq("repo_id", repo.id);
      return { ...repo, commits: count ?? 0 };
    })
  );

  return (
    <main className="min-h-screen p-8 md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Status Pulse</h1>
          <p className="text-muted-foreground text-lg">
            Multi-tenant project status dashboard for InnoIT client verticals.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenant</CardTitle>
              <Badge variant="secondary">innoit</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Alexion</div>
              <p className="text-xs text-muted-foreground">AstraZeneca subsidiary</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repositories</CardTitle>
              <Badge variant="secondary">{repos?.length ?? 0}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {repoStats.reduce((sum, r) => sum + r.commits, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Tracked commits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest coverage</CardTitle>
              <Badge>{coverage ? `${coverage.coverage_pct?.toFixed(2)}%` : "—"}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {coverage ? `${coverage.covered_lines}/${coverage.total_lines}` : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {coverage && typeof coverage.repos === "object" && coverage.repos !== null
                  ? (coverage.repos as { name?: string }).name ?? "Unknown repo"
                  : "No coverage data"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Commits per repository</CardTitle>
            <CardDescription>Seeded commit counts from local git history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              {repoStats.map((repo) => (
                <div key={repo.id} className="rounded-lg border p-4">
                  <div className="text-sm font-medium">{repo.name}</div>
                  <div className="text-2xl font-bold">{repo.commits}</div>
                  <div className="text-xs text-muted-foreground">{repo.slug}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent commits</CardTitle>
            <CardDescription>Latest 10 commits across all tracked repositories.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Repo</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[160px]">Author</TableHead>
                  <TableHead className="w-[160px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentCommits ?? []).map((commit) => {
                  const repo =
                    typeof commit.repos === "object" && commit.repos !== null
                      ? (commit.repos as { name?: string; slug?: string })
                      : { name: "—", slug: "—" };
                  return (
                    <TableRow key={commit.sha}>
                      <TableCell className="font-medium">{repo.name}</TableCell>
                      <TableCell className="max-w-md truncate">{commit.message}</TableCell>
                      <TableCell>{commit.author_name}</TableCell>
                      <TableCell>
                        {new Date(commit.authored_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

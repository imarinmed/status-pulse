import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { IMARIN_PROFILE, commitTitle } from "@/lib/imarin";

export interface ImarinHeroProps {
  totalCommits: number;
  imarinCommits: number;
  reposTouched: number;
  latestCommitAt: string | null;
  latestCommitMessage: string | null;
  latestCommitRepo: string | null;
  coveragePct: number | null;
  coverageRepo: string | null;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const day = 86_400_000;
  const days = Math.floor(diffMs / day);
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function ImarinHero({
  totalCommits,
  imarinCommits,
  reposTouched,
  latestCommitAt,
  latestCommitMessage,
  latestCommitRepo,
  coveragePct,
  coverageRepo,
}: ImarinHeroProps) {
  const share = totalCommits > 0 ? (imarinCommits / totalCommits) * 100 : 0;

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-background relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl"
      />
      <CardContent className="relative grid gap-8 p-8 md:grid-cols-[auto_1fr] md:p-10">
        <div className="flex flex-col items-start gap-4">
          <Avatar size="lg" className="size-16 ring-2 ring-amber-400/60">
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-base font-bold text-amber-950">
              {IMARIN_PROFILE.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <Badge
              variant="outline"
              className="border-amber-500/50 bg-amber-500/10 text-amber-200"
            >
              Spotlight contributor
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">
              {IMARIN_PROFILE.role}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {IMARIN_PROFILE.displayName} is steering the CMC Metrics platform.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Driving the FastAPI backend and Next.js frontend that power the CMC
              dashboards — initial imports, hardening passes, contributor docs,
              and the end-to-end test contract that protects every release.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Stat
              label="imarin commits"
              value={imarinCommits.toString()}
              caption={`of ${totalCommits} tracked (${share.toFixed(1)}%)`}
            />
            <Stat
              label="Repositories driven"
              value={reposTouched.toString()}
              caption="CMC Metrics API + UI"
            />
            <Stat
              label="API coverage"
              value={coveragePct !== null ? `${coveragePct.toFixed(2)}%` : "—"}
              caption={coverageRepo ?? "—"}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>imarin&apos;s share of tracked commits</span>
              <span className="font-mono text-amber-200">{share.toFixed(1)}%</span>
            </div>
            <Progress
              value={share}
              className="h-2 bg-amber-500/15 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-amber-400 [&>[data-slot=progress-indicator]]:to-orange-500"
            />
          </div>

          <Separator className="bg-amber-500/20" />

          <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
            <div className="space-y-0.5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Latest imarin commit
              </p>
              <p className="line-clamp-1 font-medium">
                {latestCommitMessage ? commitTitle(latestCommitMessage) : "—"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {latestCommitRepo && (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {latestCommitRepo}
                </Badge>
              )}
              <span>{formatRelative(latestCommitAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-background/50 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-amber-100">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

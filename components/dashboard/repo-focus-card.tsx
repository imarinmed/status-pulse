import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { IMARIN_PROFILE, commitTitle, shortSha } from "@/lib/imarin";

export interface RepoFocusCardProps {
  name: string;
  slug: string;
  totalCommits: number;
  imarinCommits: number;
  coveragePct: number | null;
  latestImarinCommit: {
    sha: string;
    message: string;
    authoredAt: string;
  } | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RepoFocusCard({
  name,
  slug,
  totalCommits,
  imarinCommits,
  coveragePct,
  latestImarinCommit,
}: RepoFocusCardProps) {
  const share = totalCommits > 0 ? (imarinCommits / totalCommits) * 100 : 0;
  const coverageDisplay =
    coveragePct !== null ? `${coveragePct.toFixed(2)}%` : "—";

  return (
    <Card className="h-full">
      <CardHeader className="gap-1.5">
        <Badge
          variant="outline"
          className="w-fit font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Repository
        </Badge>
        <CardTitle className="font-mono text-base font-medium tracking-tight">
          {name}
        </CardTitle>
        <p className="font-mono text-xs text-muted-foreground">{slug}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <RepoStat label="Total" value={totalCommits.toString()} />
          <RepoStat
            label="@imarin"
            value={imarinCommits.toString()}
            accent
          />
          <RepoStat label="Coverage" value={coverageDisplay} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="uppercase tracking-[0.16em] text-muted-foreground">
              @imarin share
            </span>
            <span className="tabular-nums text-amber-200">
              {share.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={share}
            className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-amber-500"
          />
        </div>

        {latestImarinCommit && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>Latest by @{IMARIN_PROFILE.handle}</span>
                <span className="text-amber-200">
                  {shortSha(latestImarinCommit.sha)}
                </span>
              </div>
              <p className="line-clamp-2 text-sm font-medium text-foreground">
                {commitTitle(latestImarinCommit.message)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(latestImarinCommit.authoredAt)}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RepoStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          accent
            ? "text-2xl font-semibold tabular-nums text-amber-200"
            : "text-2xl font-semibold tabular-nums text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}

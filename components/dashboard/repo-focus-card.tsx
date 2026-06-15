import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IMARIN_PROFILE, commitTitle } from "@/lib/imarin";

export interface RepoFocusCardProps {
  name: string;
  slug: string;
  totalCommits: number;
  imarinCommits: number;
  coveragePct: number | null;
  coveredLines: number | null;
  totalLines: number | null;
  branch: string | null;
  latestImarinCommit: {
    message: string;
    authoredAt: string;
  } | null;
  accent: "amber" | "violet";
}

const ACCENTS = {
  amber: {
    ring: "ring-amber-500/30",
    border: "border-amber-500/30",
    glow: "from-amber-500/10 via-background to-background",
    pill: "bg-amber-500/15 text-amber-200 border-amber-500/40",
    bar: "[&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-amber-400 [&>[data-slot=progress-indicator]]:to-orange-500 bg-amber-500/15",
    chip: "bg-amber-500/20 text-amber-100",
  },
  violet: {
    ring: "ring-violet-500/30",
    border: "border-violet-500/30",
    glow: "from-violet-500/10 via-background to-background",
    pill: "bg-violet-500/15 text-violet-200 border-violet-500/40",
    bar: "[&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-violet-400 [&>[data-slot=progress-indicator]]:to-fuchsia-500 bg-violet-500/15",
    chip: "bg-violet-500/20 text-violet-100",
  },
} as const;

export function RepoFocusCard({
  name,
  slug,
  totalCommits,
  imarinCommits,
  coveragePct,
  coveredLines,
  totalLines,
  branch,
  latestImarinCommit,
  accent,
}: RepoFocusCardProps) {
  const palette = ACCENTS[accent];
  const share = totalCommits > 0 ? (imarinCommits / totalCommits) * 100 : 0;
  const coverageDisplay =
    coveragePct !== null ? `${coveragePct.toFixed(2)}%` : "Pending";

  return (
    <Card
      className={`relative overflow-hidden ${palette.border} bg-gradient-to-br ${palette.glow}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full ${palette.chip} blur-3xl opacity-50`}
      />
      <CardHeader className="relative gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Badge variant="outline" className={palette.pill}>
              Focus repository
            </Badge>
            <CardTitle className="text-xl font-semibold">{name}</CardTitle>
            <p className="font-mono text-xs text-muted-foreground">{slug}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Coverage
            </span>
            <span className="text-xl font-bold tabular-nums">
              {coverageDisplay}
            </span>
            {branch && (
              <span className="font-mono text-[10px] text-muted-foreground">
                branch {branch}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Total commits" value={totalCommits} />
          <Metric label="imarin commits" value={imarinCommits} accent />
          <Metric
            label="Lines covered"
            value={
              coveredLines !== null && totalLines !== null
                ? `${coveredLines.toLocaleString()}/${totalLines.toLocaleString()}`
                : "—"
            }
            small
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">imarin contribution share</span>
            <span className="font-mono text-amber-200">{share.toFixed(1)}%</span>
          </div>
          <Progress value={share} className={`h-2 ${palette.bar}`} />
        </div>

        {latestImarinCommit && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Avatar size="sm" className="size-6">
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-amber-950">
                  {IMARIN_PROFILE.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] uppercase tracking-wider text-amber-200">
                Latest by {IMARIN_PROFILE.handle}
              </span>
            </div>
            <p className="line-clamp-2 text-sm font-medium">
              {commitTitle(latestImarinCommit.message)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(latestImarinCommit.authoredAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        accent
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-border bg-background/40"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-bold tabular-nums ${
          small ? "text-sm" : "text-2xl"
        } ${accent ? "text-amber-100" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IMARIN_PROFILE } from "@/lib/imarin";

export interface IdentityHeroProps {
  tagline: string;
  stats: {
    totalPushes: number;
    totalLoc: number;
    activeDays: number;
    activeDaysTotal: number;
    activeWeeks: number;
    activeWeeksTotal: number;
    sharePct: number;
    reposTouched: number;
    repoTotal: number;
  };
}

export function IdentityHero({ tagline, stats }: IdentityHeroProps) {
  const quickStats = [
    { label: "Pushes", value: stats.totalPushes.toLocaleString() },
    { label: "LOC changed", value: stats.totalLoc.toLocaleString() },
    {
      label: "Active days",
      value: `${stats.activeDays} / ${stats.activeDaysTotal}`,
    },
    {
      label: "Active weeks",
      value: `${stats.activeWeeks} / ${stats.activeWeeksTotal}`,
    },
  ];

  return (
    <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-card to-card">
      {/* Soft amber glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-56 rounded-full bg-amber-500/5 blur-3xl" />

      <CardContent className="relative p-8 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <Avatar
            size="lg"
            className="size-24 shrink-0 ring-2 ring-amber-500/70 ring-offset-4 ring-offset-card md:size-28"
          >
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-2xl font-semibold tracking-tight text-amber-950 md:text-3xl">
              {IMARIN_PROFILE.initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300"
              >
                Contributor spotlight
              </Badge>
              <Badge
                variant="secondary"
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                @{IMARIN_PROFILE.handle}
              </Badge>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {IMARIN_PROFILE.displayName}
              </h1>
              <p className="text-sm font-medium text-amber-200/80">
                {IMARIN_PROFILE.role}
              </p>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {tagline}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-amber-500/10 bg-amber-500/[0.05] p-3"
                >
                  <div className="font-mono text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                {stats.reposTouched} of {stats.repoTotal} repos touched
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-amber-500" />
                {stats.sharePct.toFixed(1)}% of tracked commits
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

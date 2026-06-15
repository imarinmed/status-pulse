"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { IMARIN_PROFILE } from "@/lib/imarin";

export interface WeeklyActivityPoint {
  /** ISO week key (YYYY-Www) — stable identifier for the bucket. */
  week: string;
  /** Compact display label, e.g. "Mar 4". */
  label: string;
  /** Number of imarin commits in this ISO week. */
  commits: number;
  /** Sum of additions + deletions across imarin commits in this week. */
  loc: number;
}

export interface WeeklyActivityChartProps {
  data: WeeklyActivityPoint[];
}

const chartConfig: ChartConfig = {
  commits: {
    label: "Commits",
    color: "oklch(0.78 0.16 75)", // amber-300-ish, matches dashboard accent
  },
};

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const totalCommits = data.reduce((sum, d) => sum + d.commits, 0);
  const totalLoc = data.reduce((sum, d) => sum + d.loc, 0);
  const activeWeeks = data.filter((d) => d.commits > 0).length;

  return (
    <Card>
      <CardHeader className="gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium tracking-tight">
              Weekly activity
            </CardTitle>
            <CardDescription>
              Commits per ISO week by @{IMARIN_PROFILE.handle} across focus
              repositories.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>
              <span className="text-foreground tabular-nums">
                {totalCommits.toLocaleString()}
              </span>{" "}
              commits
            </span>
            <span>
              <span className="text-foreground tabular-nums">
                {totalLoc.toLocaleString()}
              </span>{" "}
              LOC
            </span>
            <span>
              <span className="text-foreground tabular-nums">
                {activeWeeks}
              </span>{" "}
              active wks
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            No commits in the recorded window.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-56 w-full"
          >
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="22%"
            >
              <CartesianGrid
                vertical={false}
                stroke="oklch(1 0 0 / 8%)"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={8}
                interval="preserveStartEnd"
                tick={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={28}
                tickMargin={4}
                tick={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              />
              <ChartTooltip
                cursor={{ fill: "oklch(1 0 0 / 6%)" }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload as
                        | WeeklyActivityPoint
                        | undefined;
                      if (!point) return "";
                      return `Week of ${point.label} · ${point.week}`;
                    }}
                    formatter={(value, _name, item) => {
                      const point = item?.payload as
                        | WeeklyActivityPoint
                        | undefined;
                      return (
                        <div className="flex w-full flex-col gap-0.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              Commits
                            </span>
                            <span className="font-mono font-medium text-foreground tabular-nums">
                              {Number(value).toLocaleString()}
                            </span>
                          </div>
                          {point && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">
                                LOC changed
                              </span>
                              <span className="font-mono font-medium text-foreground tabular-nums">
                                {point.loc.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey="commits"
                fill="var(--color-commits)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

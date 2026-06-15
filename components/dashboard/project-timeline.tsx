"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IMARIN_PROFILE,
  buildTimelineTicks,
  segmentToPositions,
  shortDayLabel,
  type ProjectTimelineModel,
  type TimelineSegment,
} from "@/lib/imarin";
import { cn } from "@/lib/utils";

export interface ProjectTimelineProps {
  model: ProjectTimelineModel;
}

/**
 * Continuous Gantt-style timeline. One row per project group; bars
 * represent milestones, "Other work" runs, and explicit idle gaps.
 *
 * Layout is pure CSS (absolute positioning over a relative row) — Recharts
 * isn't well-suited to interleaved categorical / temporal segments.
 */
export function ProjectTimeline({ model }: ProjectTimelineProps) {
  const ticks = buildTimelineTicks(model.startIso, model.endIso, 8);
  const grandLoc = model.rows.reduce((s, r) => s + r.totalLoc, 0);
  const grandCommits = model.rows.reduce((s, r) => s + r.totalCommits, 0);

  return (
    <Card>
      <CardHeader className="gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium tracking-tight">
              Project timeline
            </CardTitle>
            <CardDescription>
              Milestones, work runs, and idle gaps for @{IMARIN_PROFILE.handle}{" "}
              across CMC Metrics and CMC Command Center.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>
              <span className="text-foreground tabular-nums">
                {grandCommits.toLocaleString()}
              </span>{" "}
              commits
            </span>
            <span>
              <span className="text-foreground tabular-nums">
                {grandLoc.toLocaleString()}
              </span>{" "}
              LOC
            </span>
            <span>
              <span className="text-foreground tabular-nums">
                {shortDayLabel(model.startIso)} → {shortDayLabel(model.endIso)}
              </span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        <Legend />

        <div className="space-y-5">
          {model.rows.map((row) => (
            <TimelineRow
              key={row.project.id}
              row={row}
              windowStartIso={model.startIso}
              windowEndIso={model.endIso}
            />
          ))}
        </div>

        <TimelineAxis ticks={ticks} />
      </CardContent>
    </Card>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
      <LegendDot className="bg-amber-500" label="Milestone · primary" />
      <LegendDot className="bg-blue-400" label="Milestone · QA / docs" />
      <LegendDot className="bg-emerald-400" label="Other work" />
      <LegendDot className="bg-zinc-600" label="Idle gap" />
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={cn("inline-block size-2 rounded-sm", className)} />
      {label}
    </span>
  );
}

interface TimelineRowProps {
  row: ProjectTimelineModel["rows"][number];
  windowStartIso: string;
  windowEndIso: string;
}

function TimelineRow({ row, windowStartIso, windowEndIso }: TimelineRowProps) {
  const idleSegments = row.segments.filter((s) => s.kind === "idle");
  const activeSegments = row.segments.filter((s) => s.kind !== "idle");

  return (
    <div className="grid gap-2 md:grid-cols-[14rem_1fr] md:items-center md:gap-4">
      {/* Row header */}
      <div className="space-y-0.5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300/80">
          {row.project.tag}
        </div>
        <div className="text-sm font-medium tracking-tight text-foreground">
          {row.project.title}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          {row.project.subtitle}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="text-foreground tabular-nums">
            {row.totalCommits}
          </span>{" "}
          commits ·{" "}
          <span className="text-foreground tabular-nums">
            {row.totalLoc.toLocaleString()}
          </span>{" "}
          LOC
        </div>
      </div>

      {/* Row track */}
      <div className="relative">
        <div
          aria-label={`${row.project.title} timeline`}
          className="relative h-12 w-full overflow-hidden rounded-md border border-border/60 bg-muted/40"
        >
          {/* Idle gaps render first so milestone bars paint over them. */}
          {idleSegments.map((segment) => (
            <SegmentBar
              key={segment.id}
              segment={segment}
              windowStartIso={windowStartIso}
              windowEndIso={windowEndIso}
            />
          ))}
          {activeSegments.map((segment) => (
            <SegmentBar
              key={segment.id}
              segment={segment}
              windowStartIso={windowStartIso}
              windowEndIso={windowEndIso}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SegmentBarProps {
  segment: TimelineSegment;
  windowStartIso: string;
  windowEndIso: string;
}

function SegmentBar({ segment, windowStartIso, windowEndIso }: SegmentBarProps) {
  const pos = segmentToPositions(segment, windowStartIso, windowEndIso);
  if (!pos) return null;

  const styles = SEGMENT_STYLES[segment.kind];
  const accent = segment.accent ?? "neutral";

  // Idle bars sit at the row baseline; work/milestone bars sit on top.
  const verticalClass =
    segment.kind === "idle"
      ? "top-1/2 h-3 -translate-y-1/2"
      : "top-1.5 bottom-1.5";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`${segment.label} · ${shortDayLabel(segment.startIso)} – ${shortDayLabel(segment.endIso)}`}
          className={cn(
            "absolute cursor-pointer rounded-sm border transition-[transform,filter] duration-150 ease-out hover:z-10 hover:scale-y-[1.06] hover:brightness-110",
            verticalClass,
            styles.base,
            ACCENT_STYLES[accent]
          )}
          style={{
            left: `${pos.left * 100}%`,
            width: `${Math.max(pos.width * 100, 0.4)}%`,
          }}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        className="max-w-sm bg-popover px-0 py-0 text-popover-foreground"
      >
        <SegmentTooltipContent segment={segment} />
      </TooltipContent>
    </Tooltip>
  );
}

const SEGMENT_STYLES: Record<TimelineSegment["kind"], { base: string }> = {
  milestone: { base: "shadow-sm" },
  work: { base: "shadow-sm" },
  idle: { base: "" },
};

const ACCENT_STYLES: Record<
  "amber" | "blue" | "violet" | "emerald" | "neutral",
  string
> = {
  amber: "bg-amber-500/85 border-amber-400/60",
  blue: "bg-blue-500/80 border-blue-400/60",
  violet: "bg-violet-500/80 border-violet-400/60",
  emerald: "bg-emerald-500/80 border-emerald-400/60",
  // Idle: muted zinc, slightly translucent so the track shows through.
  neutral:
    "bg-zinc-700/60 border-zinc-600/50 [background-image:repeating-linear-gradient(135deg,oklch(1_0_0/0.04)_0,oklch(1_0_0/0.04)_4px,transparent_4px,transparent_8px)]",
};

function SegmentTooltipContent({ segment }: { segment: TimelineSegment }) {
  const kindLabel =
    segment.kind === "milestone"
      ? "Milestone"
      : segment.kind === "work"
        ? "Work run"
        : "Idle";

  return (
    <div className="flex w-72 flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {kindLabel}
          </div>
          <div className="text-sm font-medium leading-snug text-foreground">
            {segment.label}
          </div>
        </div>
        <div className="shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <div>{shortDayLabel(segment.startIso)}</div>
          <div className="text-foreground/70">
            → {shortDayLabel(segment.endIso)}
          </div>
        </div>
      </div>

      {segment.kind !== "idle" && (
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2">
          <TooltipStat label="Commits" value={segment.commits.toLocaleString()} />
          <TooltipStat label="LOC changed" value={segment.loc.toLocaleString()} />
        </div>
      )}

      {segment.topMessage && (
        <div className="space-y-0.5 border-t border-border/60 pt-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Top commit
          </div>
          <p className="line-clamp-2 text-xs text-foreground">
            {segment.topMessage}
          </p>
        </div>
      )}

      {segment.kind === "idle" && segment.reason && (
        <div className="space-y-0.5 border-t border-border/60 pt-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Blocker
          </div>
          <p className="text-xs text-foreground/90">{segment.reason}</p>
        </div>
      )}
    </div>
  );
}

function TooltipStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-sm tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

interface TimelineAxisProps {
  ticks: { iso: string; label: string }[];
}

function TimelineAxis({ ticks }: TimelineAxisProps) {
  if (ticks.length === 0) return null;
  const firstTs = new Date(ticks[0].iso).getTime();
  const lastTs = new Date(ticks[ticks.length - 1].iso).getTime();
  const span = lastTs - firstTs || 1;

  return (
    <div className="grid gap-2 md:grid-cols-[14rem_1fr] md:gap-4">
      <div />
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-0 h-px bg-border/60" />
        {ticks.map((tick, idx) => {
          const ts = new Date(tick.iso).getTime();
          const left = ((ts - firstTs) / span) * 100;
          return (
            <div
              key={tick.iso}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
              style={{ left: `${left}%` }}
            >
              <span aria-hidden className="h-1.5 w-px bg-border" />
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground tabular-nums",
                  idx === 0 && "translate-x-1/2",
                  idx === ticks.length - 1 && "-translate-x-1/2"
                )}
              >
                {tick.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

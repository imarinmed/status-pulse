import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IMARIN_PROFILE, commitTitle, isImarin, shortSha } from "@/lib/imarin";
import { cn } from "@/lib/utils";

export interface CommitRowData {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string | null;
  authoredAt: string;
  repoName: string;
  repoSlug: string;
}

export interface ActivityTimelineProps {
  commits: CommitRowData[];
}

function initialsFor(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "??"
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityTimeline({ commits }: ActivityTimelineProps) {
  const imarinCount = commits.filter((c) =>
    isImarin(c.authorEmail, c.authorName)
  ).length;

  return (
    <Card>
      <CardHeader className="gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium tracking-tight">
              Activity timeline
            </CardTitle>
            <CardDescription>
              Recent commits across all repositories.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300"
          >
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-amber-500" />
            {imarinCount} by @{IMARIN_PROFILE.handle}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <Separator />
        <ul className="divide-y divide-border">
          {commits.map((commit) => {
            const mine = isImarin(commit.authorEmail, commit.authorName);
            return (
              <li
                key={commit.sha}
                className={cn(
                  "relative flex items-start gap-4 px-6 py-4 transition-colors",
                  mine && "bg-amber-500/[0.04]"
                )}
              >
                {mine && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-0.5 bg-amber-500"
                  />
                )}

                <Avatar size="sm" className="size-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-[10px] font-semibold",
                      mine && "bg-amber-500 text-amber-950"
                    )}
                  >
                    {mine
                      ? IMARIN_PROFILE.initials
                      : initialsFor(commit.authorName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className={cn(
                      "line-clamp-2 text-sm leading-snug",
                      mine
                        ? "font-medium text-foreground"
                        : "text-foreground/90"
                    )}
                  >
                    {commitTitle(commit.message)}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                    <span className="text-foreground/70">
                      {commit.repoName}
                    </span>
                    <span aria-hidden>·</span>
                    <span
                      className={
                        mine ? "text-amber-300" : "text-muted-foreground"
                      }
                    >
                      {shortSha(commit.sha)}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{commit.authorName}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right font-mono text-[11px] text-muted-foreground">
                  {formatDate(commit.authoredAt)}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

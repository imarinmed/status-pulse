import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IMARIN_PROFILE, commitTitle, isImarin, shortSha } from "@/lib/imarin";

export interface CommitRowData {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string | null;
  authoredAt: string;
  repoName: string;
  repoSlug: string;
}

export interface RecentCommitsTableProps {
  commits: CommitRowData[];
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentCommitsTable({ commits }: RecentCommitsTableProps) {
  const imarinCount = commits.filter((c) => isImarin(c.authorEmail, c.authorName))
    .length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Recent commits</CardTitle>
          <CardDescription>
            Latest {commits.length} commits across tracked repositories.{" "}
            <span className="text-amber-200">
              {imarinCount} by {IMARIN_PROFILE.displayName}
            </span>
            .
          </CardDescription>
        </div>
        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-200">
          <span className="mr-1.5 inline-block size-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
          imarin rows highlighted
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Repository</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[200px]">Author</TableHead>
                <TableHead className="w-[150px] text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commits.map((commit) => {
                const mine = isImarin(commit.authorEmail, commit.authorName);
                return (
                  <TableRow
                    key={commit.sha}
                    className={
                      mine
                        ? "relative bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent hover:from-amber-500/20"
                        : ""
                    }
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{commit.repoName}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {shortSha(commit.sha)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {mine && (
                          <span
                            aria-hidden
                            className="mt-1.5 inline-block h-3 w-1 shrink-0 rounded-full bg-gradient-to-b from-amber-400 to-orange-500"
                          />
                        )}
                        <span
                          className={`line-clamp-2 max-w-xl text-sm ${
                            mine ? "font-medium text-amber-50" : ""
                          }`}
                        >
                          {commitTitle(commit.message)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm" className="size-7">
                          <AvatarFallback
                            className={
                              mine
                                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-amber-950"
                                : "text-[10px]"
                            }
                          >
                            {mine
                              ? IMARIN_PROFILE.initials
                              : initialsFor(commit.authorName) || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm ${
                              mine ? "font-semibold text-amber-100" : ""
                            }`}
                          >
                            {commit.authorName}
                          </span>
                          {mine && (
                            <span className="text-[10px] uppercase tracking-wider text-amber-300/80">
                              Spotlight
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(commit.authoredAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

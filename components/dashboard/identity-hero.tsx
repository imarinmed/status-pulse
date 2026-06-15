import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IMARIN_PROFILE } from "@/lib/imarin";

export interface IdentityHeroProps {
  tagline: string;
}

export function IdentityHero({ tagline }: IdentityHeroProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-8 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          <Avatar
            size="lg"
            className="size-24 shrink-0 ring-2 ring-amber-500/70 ring-offset-4 ring-offset-card md:size-28"
          >
            <AvatarFallback className="bg-amber-500 text-2xl font-semibold tracking-tight text-amber-950 md:text-3xl">
              {IMARIN_PROFILE.initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300"
              >
                Contributor spotlight
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                @{IMARIN_PROFILE.handle}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {IMARIN_PROFILE.displayName}
            </h1>

            <p className="text-sm font-medium text-muted-foreground">
              {IMARIN_PROFILE.role}
            </p>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {tagline}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

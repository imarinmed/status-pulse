import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ImpactMetricProps {
  label: string;
  value: string;
  caption?: string;
  accent?: boolean;
}

export function ImpactMetric({
  label,
  value,
  caption,
  accent = false,
}: ImpactMetricProps) {
  return (
    <Card
      className={cn(
        "h-full transition-colors",
        accent && "border-amber-500/40 bg-amber-500/[0.04]"
      )}
    >
      <CardHeader className="gap-1 pb-2">
        <CardDescription
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.18em]",
            accent ? "text-amber-300/80" : "text-muted-foreground"
          )}
        >
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <CardTitle
          className={cn(
            "font-mono text-4xl font-semibold tabular-nums tracking-tight",
            accent ? "text-amber-200" : "text-foreground"
          )}
        >
          {value}
        </CardTitle>
        {caption && (
          <p className="text-xs text-muted-foreground">{caption}</p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReconciliationHealth as ReconciliationHealthType } from "@/types/dashboard";

interface ReconciliationHealthProps {
  data?: ReconciliationHealthType;
  loading?: boolean;
}

export function ReconciliationHealth({ data, loading = false }: ReconciliationHealthProps) {
  const pct = data?.matched_pct ?? 0;

  // Arc parameters
  const r = 36;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct / 100);

  const arcColor =
    pct >= 90 ? "hsl(190,96%,52%)" :
    pct >= 70 ? "hsl(38,92%,55%)" :
    "hsl(0,72%,56%)";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-[15px] font-semibold text-foreground">Reconciliation</h2>
      <p className="mt-0.5 text-xs text-muted-foreground mb-4">Match rate this period</p>

      {loading ? (
        <div className="flex items-center gap-5">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {/* Donut arc */}
          <div className="relative shrink-0">
            <svg width="100" height="100" className="-rotate-90">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
              <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={arcColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold currency-font" style={{ color: arcColor }}>
                {pct.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <Stat label="Matched" value={data?.total_matched ?? 0} color="text-primary" />
            <Stat label="Pending" value={data?.unmatched_count ?? 0} color="text-warning" />
            <Stat label="Exceptions" value={data?.exceptions_count ?? 0} color="text-destructive" />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 w-2 rounded-full", color === "text-primary" ? "bg-primary" : color === "text-warning" ? "bg-warning" : "bg-destructive")} />
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <span className={cn("text-sm font-semibold currency-font", color)}>{value}</span>
    </div>
  );
}

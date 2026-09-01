import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: number;
  currency?: boolean;
  changePct?: number | null;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  variant?: "default" | "danger" | "success";
  loading?: boolean;
  suffix?: string;
}

export function MetricCard({
  title,
  value,
  currency = true,
  changePct,
  icon: Icon,
  iconColor = "text-primary",
  variant = "default",
  loading = false,
  suffix,
}: MetricCardProps) {
  const isPositive = changePct !== null && changePct !== undefined && changePct > 0;
  const isNegative = changePct !== null && changePct !== undefined && changePct < 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-5 transition-shadow hover:shadow-md",
        variant === "danger" && "border-destructive/20 bg-destructive/5",
        variant === "success" && "border-success/20 bg-success/5",
        variant === "default" && "border-border"
      )}
    >
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                variant === "danger" ? "bg-destructive/10" : "bg-muted"
              )}
            >
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
          </div>

          <div className="mt-2">
            <p className={cn("text-2xl font-bold tracking-tight currency-font",
              variant === "danger" && "text-destructive",
              variant === "success" && "text-success"
            )}>
              {currency ? formatCurrency(value) : value.toLocaleString("en-IN")}
              {suffix && <span className="ml-1 text-base font-medium text-muted-foreground">{suffix}</span>}
            </p>
          </div>

          {changePct !== undefined && changePct !== null && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive && <ArrowUpRight className="h-3.5 w-3.5 text-success" />}
              {isNegative && <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
              {!isPositive && !isNegative && <Minus className="h-3 w-3 text-muted-foreground" />}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive && "text-success",
                  isNegative && "text-destructive",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}
              >
                {isPositive ? "+" : ""}
                {changePct.toFixed(1)}% vs last month
              </span>
            </div>
          )}

          {/* Decorative background element */}
          <div
            className={cn(
              "absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-5",
              variant === "danger" ? "bg-destructive" : "bg-primary"
            )}
          />
        </>
      )}
    </div>
  );
}

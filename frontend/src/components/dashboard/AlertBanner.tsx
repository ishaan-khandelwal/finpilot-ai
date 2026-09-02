"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { DashboardAlert } from "@/types/dashboard";

interface AlertBannerProps {
  alerts: DashboardAlert[];
}

const severityConfig = {
  critical: { bg: "bg-destructive/10 border-destructive/30", text: "text-destructive", icon: "text-destructive" },
  high:     { bg: "bg-destructive/8 border-destructive/20", text: "text-destructive", icon: "text-destructive" },
  medium:   { bg: "bg-warning/8 border-warning/20", text: "text-warning", icon: "text-warning" },
  low:      { bg: "bg-muted border-border", text: "text-muted-foreground", icon: "text-muted-foreground" },
};

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visible = alerts.filter((_, i) => !dismissed.has(i));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alert, originalIndex) => {
        const cfg = severityConfig[alert.severity] ?? severityConfig.low;
        return (
          <div
            key={originalIndex}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3 animate-fade-in",
              cfg.bg
            )}
          >
            <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", cfg.icon)} />
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", cfg.text)}>{alert.message}</p>
              {alert.amount && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Amount due: <span className="font-medium currency-font">{formatCurrency(alert.amount)}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, originalIndex]))}
              className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss alert"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

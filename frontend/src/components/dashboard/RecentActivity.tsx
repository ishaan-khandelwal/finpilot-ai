"use client";

import { cn, formatCurrency, formatRelativeDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { RecentTransaction } from "@/types/dashboard";

interface RecentActivityProps {
  transactions: RecentTransaction[];
  loading?: boolean;
}

export function RecentActivity({ transactions, loading = false }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold text-foreground">Recent Activity</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Latest bank transactions</p>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : transactions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Upload a bank statement to get started.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
              {/* Icon */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  tx.type === "credit" ? "bg-primary/10" : "bg-accent/10"
                )}
              >
                {tx.type === "credit" ? (
                  <ArrowDownLeft className="h-4 w-4 text-primary" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-accent" />
                )}
              </div>

              {/* Description + date */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(tx.date)}</span>
                  {tx.category && (
                    <Badge variant="muted" className="text-[10px] px-1.5 py-0">{tx.category}</Badge>
                  )}
                </div>
              </div>

              {/* Amount */}
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold currency-font",
                  tx.type === "credit" ? "text-primary" : "text-accent"
                )}
              >
                {tx.type === "credit" ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

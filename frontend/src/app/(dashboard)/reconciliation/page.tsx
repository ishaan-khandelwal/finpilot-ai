"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, GitMerge, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";

interface ReconciliationMatch {
  id: string;
  invoice_id: string | null;
  transaction_id: string | null;
  match_type: string;
  confidence_score: number;
  status: string;
  matched_amount: number;
  discrepancy_amount: number | null;
  notes: string | null;
  matched_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "muted" }> = {
  matched:    { label: "Matched",    variant: "success" },
  partial:    { label: "Partial",    variant: "warning" },
  exception:  { label: "Exception",  variant: "destructive" },
  pending:    { label: "Pending",    variant: "muted" },
};

const DEMO_MATCHES: ReconciliationMatch[] = [
  { id: "match-1", invoice_id: "inv-3", transaction_id: "tx-5", match_type: "exact_match", confidence_score: 0.99, status: "matched", matched_amount: 150000, discrepancy_amount: 0, notes: null, matched_at: "2026-08-25T16:05:00Z" },
  { id: "match-2", invoice_id: "inv-4", transaction_id: "tx-2", match_type: "exact_match", confidence_score: 0.98, status: "matched", matched_amount: 28400, discrepancy_amount: 0, notes: null, matched_at: "2026-08-29T14:40:00Z" },
  { id: "match-3", invoice_id: "inv-5", transaction_id: "tx-3", match_type: "fuzzy_match", confidence_score: 0.87, status: "matched", matched_amount: 320000, discrepancy_amount: 0, notes: "Amount matched via NEFT reference", matched_at: "2026-08-28T12:00:00Z" },
  { id: "match-4", invoice_id: "inv-1", transaction_id: null, match_type: "unmatched", confidence_score: 0, status: "exception", matched_amount: 78500, discrepancy_amount: 78500, notes: "No corresponding bank debit found", matched_at: "2026-09-01T10:00:00Z" },
  { id: "match-5", invoice_id: "inv-2", transaction_id: null, match_type: "partial_match", confidence_score: 0.65, status: "pending", matched_amount: 46500, discrepancy_amount: 46500, notes: "Waiting for next settlement", matched_at: "2026-09-01T11:00:00Z" },
];

export default function ReconciliationPage() {
  const qc = useQueryClient();
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [demoMatches, setDemoMatches] = useState<ReconciliationMatch[]>(DEMO_MATCHES);
  const isDemo = useAuthStore((s) => s.access_token)?.startsWith("demo-");

  const { data: apiMatches, isLoading } = useQuery({
    queryKey: ["reconciliation", "matches"],
    queryFn: async () => {
      const api = (await import("@/lib/api")).default;
      const { API_ROUTES } = await import("@/constants/routes");
      const { data } = await api.get<ReconciliationMatch[]>(API_ROUTES.RECONCILIATION.MATCHES);
      return data;
    },
    enabled: !isDemo,
  });

  const matches = isDemo ? demoMatches : apiMatches;

  const runMutation = useMutation({
    mutationFn: async () => {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 1500));
        return { task_id: `task-demo-${Date.now()}` };
      }
      const api = (await import("@/lib/api")).default;
      const { API_ROUTES } = await import("@/constants/routes");
      const { data } = await api.post(API_ROUTES.RECONCILIATION.RUN);
      return data;
    },
    onSuccess: (data) => {
      setRunStatus(`Reconciliation complete! (Task: ${data.task_id})`);
      if (isDemo) {
        // Mark pending items as matched in demo
        setDemoMatches((prev) => prev.map((m) => m.status === "pending" ? { ...m, status: "matched", confidence_score: 0.91 } : m));
      } else {
        qc.invalidateQueries({ queryKey: ["reconciliation"] });
      }
      setTimeout(() => setRunStatus(null), 4000);
    },
  });

  const stats = matches
    ? {
        total: matches.length,
        matched: matches.filter((m) => m.status === "matched").length,
        exceptions: matches.filter((m) => m.status === "exception").length,
        pending: matches.filter((m) => m.status === "pending").length,
      }
    : null;


  return (
    <div className="flex h-full flex-col">
      <Topbar title="Reconciliation" description="Match invoices with bank transactions automatically" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats + Action */}
        <div className="flex flex-wrap items-start gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 flex-1">
            {[
              { label: "Total Items",  value: stats?.total ?? 0,      color: "text-foreground" },
              { label: "Matched",      value: stats?.matched ?? 0,    color: "text-primary" },
              { label: "Exceptions",   value: stats?.exceptions ?? 0, color: "text-destructive" },
              { label: "Pending",      value: stats?.pending ?? 0,    color: "text-warning" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("mt-1.5 text-2xl font-bold currency-font", color)}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              id="run-reconciliation"
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
              className="gap-2"
            >
              {runMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {runMutation.isPending ? "Running…" : "Run Reconciliation"}
            </Button>
            {runStatus && (
              <p className="text-xs text-primary">{runStatus}</p>
            )}
          </div>
        </div>

        {/* Match table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3 flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-primary" />
            <h2 className="text-[14px] font-semibold text-foreground">Reconciliation Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Match Type", "Matched Amount", "Discrepancy", "Confidence", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5"><Skeleton className="h-4 w-20" /></td>
                      ))}</tr>
                    ))
                  : !matches?.length
                    ? (
                      <tr><td colSpan={6} className="px-4 py-16 text-center">
                        <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No reconciliation data yet.</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">Upload invoices and bank statements, then run reconciliation.</p>
                      </td></tr>
                    )
                  : matches.map((m) => {
                    const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.pending;
                    return (
                      <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <Badge variant="muted" className="capitalize">{m.match_type.replace("_", " ")}</Badge>
                        </td>
                        <td className="px-4 py-3.5 font-semibold currency-font text-foreground">{formatCurrency(m.matched_amount)}</td>
                        <td className="px-4 py-3.5 currency-font">
                          {m.discrepancy_amount != null && m.discrepancy_amount > 0
                            ? <span className="text-destructive">{formatCurrency(m.discrepancy_amount)}</span>
                            : <span className="text-muted-foreground">—</span>
                          }
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${(m.confidence_score * 100).toFixed(0)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{(m.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs">{formatDate(m.matched_at)}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

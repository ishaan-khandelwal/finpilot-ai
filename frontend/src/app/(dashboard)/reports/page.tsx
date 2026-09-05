"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Sparkles, RefreshCw, BarChart3 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { cn, formatDate } from "@/lib/utils";

const REPORT_TYPES = [
  { value: "profit_loss",     label: "Profit & Loss",       desc: "Monthly P&L summary with GST breakdown" },
  { value: "cash_flow",       label: "Cash Flow Statement",  desc: "Inflows, outflows, and net cash position" },
  { value: "gst_summary",     label: "GST Summary",          desc: "CGST/SGST/IGST consolidated report" },
  { value: "invoice_aging",   label: "Invoice Aging",        desc: "Overdue invoice report by aging bucket" },
  { value: "reconciliation",  label: "Reconciliation",       desc: "Full match/exception report" },
];

interface Report {
  id: string;
  report_type: string;
  title: string;
  status: "pending" | "processing" | "ready" | "failed";
  file_path: string | null;
  created_at: string;
}

const DEMO_REPORTS: Report[] = [
  {
    id: "rpt-1",
    report_type: "profit_loss",
    title: "Profit & Loss — August 2026",
    status: "ready",
    file_path: "/demo/profit_loss_aug2026.pdf",
    created_at: "2026-08-31T18:00:00Z",
  },
  {
    id: "rpt-2",
    report_type: "gst_summary",
    title: "GST Summary — August 2026",
    status: "ready",
    file_path: "/demo/gst_aug2026.pdf",
    created_at: "2026-08-31T18:05:00Z",
  },
  {
    id: "rpt-3",
    report_type: "cash_flow",
    title: "Cash Flow Statement — Q3 2026",
    status: "processing",
    file_path: null,
    created_at: "2026-09-01T09:30:00Z",
  },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "muted" }> = {
  ready:      { label: "Ready",      variant: "success" },
  processing: { label: "Processing", variant: "warning" },
  pending:    { label: "Pending",    variant: "muted" },
  failed:     { label: "Failed",     variant: "destructive" },
};

export default function ReportsPage() {
  const qc = useQueryClient();
  const [selectedType, setSelectedType] = useState("profit_loss");
  const [demoReports, setDemoReports] = useState<Report[]>(DEMO_REPORTS);
  const isDemo = useAuthStore((s) => s.access_token)?.startsWith("demo-");

  const { data: apiReports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { default: api } = await import("@/lib/api");
      const { API_ROUTES } = await import("@/constants/routes");
      const { data } = await api.get<Report[]>(API_ROUTES.REPORTS.BASE);
      return data;
    },
    retry: false,
    enabled: !isDemo,
  });

  const reports = isDemo ? demoReports : apiReports;

  const generateMutation = useMutation({
    mutationFn: async (reportType: string) => {
      if (isDemo) {
        const rt = REPORT_TYPES.find((r) => r.value === reportType);
        const newReport: Report = {
          id: `rpt-${Date.now()}`,
          report_type: reportType,
          title: `${rt?.label ?? reportType} — September 2026`,
          status: "ready",
          file_path: `/demo/${reportType}_sep2026.pdf`,
          created_at: new Date().toISOString(),
        };
        setDemoReports((prev) => [newReport, ...prev]);
        return newReport;
      }
      const api = (await import("@/lib/api")).default;
      const { API_ROUTES } = await import("@/constants/routes");
      const { data } = await api.post(API_ROUTES.REPORTS.GENERATE, { report_type: reportType });
      return data;
    },
    onSuccess: () => {
      if (!isDemo) qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Reports" description="Generate and download financial reports" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Generate section */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-[15px] font-semibold text-foreground mb-1">Generate Report</h2>
          <p className="text-xs text-muted-foreground mb-4">
            AI generates detailed reports from your actual financial data
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            {REPORT_TYPES.map((rt) => (
              <button
                key={rt.value}
                onClick={() => setSelectedType(rt.value)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  selectedType === rt.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <p className={cn("text-sm font-medium", selectedType === rt.value ? "text-primary" : "text-foreground")}>
                  {rt.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{rt.desc}</p>
              </button>
            ))}
          </div>

          <Button
            id="generate-report"
            onClick={() => generateMutation.mutate(selectedType)}
            disabled={generateMutation.isPending}
            className="gap-2"
          >
            {generateMutation.isPending
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : <Sparkles className="h-4 w-4" />
            }
            {generateMutation.isPending ? "Generating…" : "Generate Report"}
          </Button>
        </div>

        {/* History */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-[14px] font-semibold">Report History</h2>
          </div>
          <div className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))
              : !reports?.length
                ? (
                  <div className="px-5 py-16 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No reports generated yet.</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Select a report type above and click Generate.
                    </p>
                  </div>
                )
                : reports.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
                  return (
                    <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        {r.status === "ready" && (
                          <Button variant="ghost" size="sm" className="gap-1.5 h-8"
                            onClick={() => alert("In production, this downloads a real PDF report. Demo PDF preview available.")}>
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>
    </div>
  );
}

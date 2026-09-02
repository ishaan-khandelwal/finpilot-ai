"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoices, useInvoiceStats } from "@/hooks/useInvoices";
import { invoiceService } from "@/services/financeService";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Upload, Search, Filter, ChevronLeft, ChevronRight,
  FileText, CheckCircle2, Clock, AlertCircle, XCircle,
} from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types/finance";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "success" | "warning" | "destructive" | "muted" | "default" }> = {
  paid:      { label: "Paid",      variant: "success" },
  partial:   { label: "Partial",   variant: "warning" },
  unpaid:    { label: "Unpaid",    variant: "default" },
  overdue:   { label: "Overdue",   variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "muted" },
};

const TABS = [
  { label: "All",       value: "" },
  { label: "Overdue",   value: "overdue" },
  { label: "Unpaid",    value: "unpaid" },
  { label: "Paid",      value: "paid" },
];

const TYPE_TABS = [
  { label: "All",         value: "" },
  { label: "Receivable",  value: "receivable" },
  { label: "Payable",     value: "payable" },
];

export function InvoicesClient() {
  const qc = useQueryClient();
  const { data, isLoading, filters, updateFilter } = useInvoices();
  const { data: stats } = useInvoiceStats();

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await invoiceService.uploadDocument(file, "invoice");
      await qc.invalidateQueries({ queryKey: ["invoices"] });
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [qc]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search || undefined);
  };

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Invoices" description="Manage and track all your invoices" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Receivable" value={stats?.total_receivable ?? 0} loading={!stats} color="text-primary" />
          <StatCard label="Total Payable"    value={stats?.total_payable ?? 0}    loading={!stats} color="text-accent" />
          <StatCard label="Overdue Amount"   value={stats?.overdue_amount ?? 0}   loading={!stats} color="text-destructive" />
          <StatCard label="Paid This Month"  value={stats?.paid_this_month ?? 0}  loading={!stats} color="text-success" />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status filter tabs */}
          <div className="flex rounded-lg border border-border p-0.5 gap-0.5">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => updateFilter("status", t.value || undefined)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  filters.status === (t.value || undefined)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Type filter */}
            <div className="flex rounded-lg border border-border p-0.5 gap-0.5">
              {TYPE_TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateFilter("invoice_type", t.value || undefined)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    filters.invoice_type === (t.value || undefined)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices…"
                className="w-40 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </form>

            {/* Upload button */}
            <label htmlFor="invoice-upload">
              <Button
                id="invoice-upload-btn"
                size="sm"
                disabled={uploading}
                className="cursor-pointer gap-1.5"
                asChild
              >
                <span>
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : "Upload Invoice"}
                  <input
                    id="invoice-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
                    className="sr-only"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </span>
              </Button>
            </label>
          </div>
        </div>

        {uploadError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
            {uploadError}
          </div>
        )}

        {/* Invoice table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Invoice #", "Type", "Party", "Date", "Due Date", "Amount", "Paid", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <Skeleton className="h-4 w-full max-w-[100px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !data?.items.length ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">No invoices found</p>
                      <p className="mt-1 text-xs text-muted-foreground/70">Upload a PDF or image to extract invoices automatically</p>
                    </td>
                  </tr>
                ) : (
                  data.items.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-xs text-muted-foreground">
                {data.total} total · Page {data.page} of {data.pages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost" size="icon"
                  disabled={data.page <= 1}
                  onClick={() => updateFilter("page", data.page - 1)}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  disabled={data.page >= data.pages}
                  onClick={() => updateFilter("page", data.page + 1)}
                  className="h-7 w-7"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ invoice: inv }: { invoice: Invoice }) {
  const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.unpaid;
  const outstanding = inv.total_amount - inv.paid_amount;

  return (
    <tr className="transition-colors hover:bg-muted/20 cursor-pointer">
      <td className="px-4 py-3.5">
        <span className="font-mono text-xs font-medium text-primary">{inv.invoice_number}</span>
      </td>
      <td className="px-4 py-3.5">
        <Badge variant={inv.invoice_type === "receivable" ? "default" : "muted"}>
          {inv.invoice_type === "receivable" ? "Receivable" : "Payable"}
        </Badge>
      </td>
      <td className="px-4 py-3.5">
        <p className="font-medium text-foreground truncate max-w-[160px]">{inv.vendor_name}</p>
        {inv.vendor_gstin && <p className="text-[11px] text-muted-foreground font-mono">{inv.vendor_gstin}</p>}
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">{formatDate(inv.invoice_date)}</td>
      <td className="px-4 py-3.5">
        {inv.due_date ? (
          <span className={cn(
            "text-sm",
            inv.status === "overdue" ? "text-destructive font-medium" : "text-muted-foreground"
          )}>
            {formatDate(inv.due_date)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 font-semibold currency-font text-foreground">
        {formatCurrency(inv.total_amount)}
      </td>
      <td className="px-4 py-3.5 currency-font">
        {outstanding > 0 ? (
          <span className="text-destructive">{formatCurrency(outstanding)}</span>
        ) : (
          <span className="text-success">—</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </td>
    </tr>
  );
}

function StatCard({ label, value, loading, color }: { label: string; value: number; loading: boolean; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1.5 h-6 w-28" />
      ) : (
        <p className={cn("mt-1.5 text-lg font-bold currency-font", color)}>
          {formatCurrency(value)}
        </p>
      )}
    </div>
  );
}

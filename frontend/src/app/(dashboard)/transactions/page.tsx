"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { transactionService } from "@/services/financeService";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { invoiceService } from "@/services/financeService";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_TABS = [
  { label: "All",     value: "" },
  { label: "Credits", value: "credit" },
  { label: "Debits",  value: "debit" },
];

export default function TransactionsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", { page, type: typeFilter }],
    queryFn: () => transactionService.list({ page, limit: 25, type: typeFilter || undefined }),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await invoiceService.uploadDocument(file, "bank_statement");
      await qc.invalidateQueries({ queryKey: ["transactions"] });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Transactions" description="Bank statement history and categorisation" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex rounded-lg border border-border p-0.5 gap-0.5">
            {TYPE_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTypeFilter(t.value); setPage(1); }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  typeFilter === t.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label htmlFor="bank-upload">
            <Button size="sm" disabled={uploading} asChild>
              <span className="cursor-pointer gap-1.5 flex items-center">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Uploading…" : "Upload Bank Statement"}
                <input id="bank-upload" type="file" accept=".pdf,.csv,.xlsx" className="sr-only" onChange={handleUpload} disabled={uploading} />
              </span>
            </Button>
          </label>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Date", "Description", "Category", "Reference", "Type", "Amount", "Balance"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5"><Skeleton className="h-4 w-full max-w-[100px]" /></td>
                    ))}</tr>
                  ))
                : !data?.items?.length
                  ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                      No transactions yet. Upload a bank statement to import them.
                    </td></tr>
                  )
                  : data.items.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 text-muted-foreground text-xs">{formatDate(tx.transaction_date)}</td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="truncate font-medium text-foreground">{tx.description}</p>
                        {tx.counterparty && <p className="text-xs text-muted-foreground truncate">{tx.counterparty}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        {tx.category ? <Badge variant="muted" className="text-[10px]">{tx.category}</Badge> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">{tx.reference ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className={cn("flex items-center gap-1.5", tx.type === "credit" ? "text-primary" : "text-accent")}>
                          {tx.type === "credit" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                          <span className="text-xs font-medium capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className={cn("px-4 py-3.5 font-semibold currency-font", tx.type === "credit" ? "text-primary" : "text-accent")}>
                        {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3.5 currency-font text-muted-foreground">
                        {tx.balance != null ? formatCurrency(tx.balance) : "—"}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-xs text-muted-foreground">{data.total} total · Page {data.page} of {data.pages}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)} className="h-7 w-7">
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

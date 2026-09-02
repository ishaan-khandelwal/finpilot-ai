"use client";

import { Topbar } from "@/components/layout/Topbar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ReconciliationHealth } from "@/components/dashboard/ReconciliationHealth";
import { useDashboardOverview } from "@/hooks/useDashboard";
import {
  Banknote,
  FileWarning,
  GitMerge,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";

export function DashboardClient() {
  const { data, isLoading } = useDashboardOverview();
  const business = useAuthStore((s) => s.business);

  const kpis = data?.kpis;
  const today = format(new Date(), "MMMM yyyy");

  return (
    <div className="flex h-full flex-col">
      <Topbar
        title="Dashboard"
        description={`${business?.name ?? "Your Business"} · ${today}`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alerts */}
        {(data?.alerts?.length ?? 0) > 0 && (
          <AlertBanner alerts={data!.alerts} />
        )}

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            title="Revenue MTD"
            value={kpis?.total_revenue_mtd ?? 0}
            changePct={kpis?.revenue_change_pct}
            icon={TrendingUp}
            iconColor="text-primary"
            loading={isLoading}
          />
          <MetricCard
            title="Net Profit MTD"
            value={kpis?.net_profit_mtd ?? 0}
            changePct={
              kpis
                ? kpis.revenue_change_pct !== null
                  ? kpis.revenue_change_pct
                  : null
                : null
            }
            icon={Banknote}
            iconColor="text-accent"
            variant={kpis && kpis.net_profit_mtd < 0 ? "danger" : "default"}
            loading={isLoading}
          />
          <MetricCard
            title="Overdue Invoices"
            value={kpis?.overdue_invoices_amount ?? 0}
            icon={FileWarning}
            iconColor="text-destructive"
            variant={kpis && kpis.overdue_invoices_count > 0 ? "danger" : "default"}
            suffix={kpis && kpis.overdue_invoices_count > 0 ? `(${kpis.overdue_invoices_count})` : undefined}
            loading={isLoading}
          />
          <MetricCard
            title="Bank Balance"
            value={kpis?.current_bank_balance ?? 0}
            icon={GitMerge}
            iconColor="text-success"
            loading={isLoading}
          />
        </div>

        {/* Charts + Activity Row */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Cash flow takes 2 columns */}
          <div className="xl:col-span-2">
            <CashFlowChart />
          </div>

          {/* Right column: Reconciliation health */}
          <div className="space-y-4">
            <ReconciliationHealth
              data={data?.reconciliation_health}
              loading={isLoading}
            />

            {/* Quick stats card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[13px] font-medium text-muted-foreground mb-3">Pending Actions</p>
              <div className="space-y-2">
                <QuickStat
                  label="Awaiting reconciliation"
                  value={kpis?.pending_reconciliation ?? 0}
                  color={kpis && kpis.pending_reconciliation > 0 ? "text-warning" : "text-muted-foreground"}
                />
                <QuickStat
                  label="Overdue invoices"
                  value={kpis?.overdue_invoices_count ?? 0}
                  color={kpis && kpis.overdue_invoices_count > 0 ? "text-destructive" : "text-muted-foreground"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity full width */}
        <RecentActivity
          transactions={data?.recent_transactions ?? []}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold currency-font ${color}`}>{value}</span>
    </div>
  );
}

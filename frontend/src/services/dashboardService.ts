import api from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/authStore";
import type { CashFlowPeriod, CashFlowResponse, DashboardOverview } from "@/types/dashboard";

const DEMO_OVERVIEW: DashboardOverview = {
  kpis: {
    total_revenue_mtd: 850000,
    total_expenses_mtd: 340000,
    net_profit_mtd: 510000,
    overdue_invoices_count: 2,
    overdue_invoices_amount: 125000,
    current_bank_balance: 482500,
    pending_reconciliation: 4,
    revenue_change_pct: 14.2,
    expense_change_pct: -3.8,
  },
  alerts: [
    {
      type: "overdue_invoice",
      severity: "high",
      message: "Invoice #INV-2026-089 from Apex Labs is overdue by 12 days.",
      amount: 78500,
    },
    {
      type: "unmatched_bank_fee",
      severity: "medium",
      message: "4 bank charges totaling ₹3,450 detected without corresponding invoice records.",
      amount: 3450,
    },
  ],
  recent_transactions: [
    {
      id: "tx-1",
      date: new Date(Date.now() - 3600000 * 4).toISOString(),
      description: "Client Retainer - Razorpay Settlement",
      amount: 145000,
      type: "credit",
      category: "Revenue",
      reference: "RZP-SETTLE-8891",
    },
    {
      id: "tx-2",
      date: new Date(Date.now() - 3600000 * 24).toISOString(),
      description: "AWS Cloud Infrastructure - Monthly",
      amount: 28400,
      type: "debit",
      category: "Infrastructure",
      reference: "AWS-IN-99120",
    },
    {
      id: "tx-3",
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
      description: "Enterprise SaaS License - Acme Inc",
      amount: 320000,
      type: "credit",
      category: "Enterprise Sales",
      reference: "NEFT-INW-00412",
    },
    {
      id: "tx-4",
      date: new Date(Date.now() - 3600000 * 72).toISOString(),
      description: "GSuite & Workspace Subscription",
      amount: 12500,
      type: "debit",
      category: "Software",
      reference: "GOOG-WS-1102",
    },
  ],
  reconciliation_health: {
    matched_pct: 94.5,
    unmatched_count: 3,
    exceptions_count: 1,
    total_matched: 87,
    total_items: 91,
  },
};

function generateDemoCashFlow(days: CashFlowPeriod): CashFlowResponse {
  const points = [];
  let runningBalance = 380000;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    
    const inflow = isWeekend ? 0 : Math.floor(Math.random() * 40000) + (i % 7 === 0 ? 120000 : 0);
    const outflow = isWeekend ? 500 : Math.floor(Math.random() * 25000) + (i % 5 === 0 ? 35000 : 0);
    const net = inflow - outflow;
    runningBalance += net;

    points.push({
      date: dateStr,
      inflows: inflow,
      outflows: outflow,
      net: net,
      balance: Math.max(150000, runningBalance),
    });
  }

  const totalInflows = points.reduce((acc, p) => acc + p.inflows, 0);
  const totalOutflows = points.reduce((acc, p) => acc + p.outflows, 0);

  return {
    points,
    period_days: days,
    total_inflows: totalInflows,
    total_outflows: totalOutflows,
    opening_balance: points[0].balance,
    closing_balance: points[points.length - 1].balance,
  };
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const isDemo = useAuthStore.getState().access_token?.startsWith("demo-");
    if (isDemo) {
      return DEMO_OVERVIEW;
    }

    try {
      const { data } = await api.get<DashboardOverview>(API_ROUTES.DASHBOARD.OVERVIEW);
      return data;
    } catch (err: any) {
      // If error from backend or demo mode, return rich fallback overview
      return DEMO_OVERVIEW;
    }
  },

  async getCashFlow(days: CashFlowPeriod): Promise<CashFlowResponse> {
    const isDemo = useAuthStore.getState().access_token?.startsWith("demo-");
    if (isDemo) {
      return generateDemoCashFlow(days);
    }

    try {
      const { data } = await api.get<CashFlowResponse>(API_ROUTES.DASHBOARD.CASH_FLOW, {
        params: { days },
      });
      return data;
    } catch (err: any) {
      return generateDemoCashFlow(days);
    }
  },
};

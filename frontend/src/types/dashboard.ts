export interface KPIs {
  total_revenue_mtd: number;
  total_expenses_mtd: number;
  net_profit_mtd: number;
  overdue_invoices_count: number;
  overdue_invoices_amount: number;
  current_bank_balance: number;
  pending_reconciliation: number;
  revenue_change_pct: number | null;
  expense_change_pct: number | null;
}

export interface DashboardAlert {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  invoice_id?: string;
  transaction_id?: string;
  amount?: number;
}

export interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string | null;
  reference: string | null;
}

export interface ReconciliationHealth {
  matched_pct: number;
  unmatched_count: number;
  exceptions_count: number;
  total_matched: number;
  total_items: number;
}

export interface DashboardOverview {
  kpis: KPIs;
  alerts: DashboardAlert[];
  recent_transactions: RecentTransaction[];
  reconciliation_health: ReconciliationHealth;
}

export interface CashFlowPoint {
  date: string;
  inflows: number;
  outflows: number;
  net: number;
  balance: number;
}

export interface CashFlowResponse {
  points: CashFlowPoint[];
  period_days: number;
  total_inflows: number;
  total_outflows: number;
  opening_balance: number;
  closing_balance: number;
}

export type CashFlowPeriod = 7 | 30 | 90;

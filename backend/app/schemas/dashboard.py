from datetime import date, datetime
from uuid import UUID

from app.schemas.common import CamelModel


class KPIs(CamelModel):
    total_revenue_mtd: float
    total_expenses_mtd: float
    net_profit_mtd: float
    overdue_invoices_count: int
    overdue_invoices_amount: float
    current_bank_balance: float
    pending_reconciliation: int
    revenue_change_pct: float | None
    expense_change_pct: float | None


class DashboardAlert(CamelModel):
    type: str
    severity: str
    message: str
    invoice_id: UUID | None = None
    transaction_id: UUID | None = None
    amount: float | None = None


class RecentTransaction(CamelModel):
    id: UUID
    date: date
    description: str
    amount: float
    type: str
    category: str | None
    reference: str | None


class ReconciliationHealth(CamelModel):
    matched_pct: float
    unmatched_count: int
    exceptions_count: int
    total_matched: int
    total_items: int


class DashboardOverview(CamelModel):
    kpis: KPIs
    alerts: list[DashboardAlert]
    recent_transactions: list[RecentTransaction]
    reconciliation_health: ReconciliationHealth


class CashFlowPoint(CamelModel):
    date: date
    inflows: float
    outflows: float
    net: float
    balance: float


class CashFlowResponse(CamelModel):
    points: list[CashFlowPoint]
    period_days: int
    total_inflows: float
    total_outflows: float
    opening_balance: float
    closing_balance: float

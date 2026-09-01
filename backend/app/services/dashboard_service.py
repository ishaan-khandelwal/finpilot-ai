from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.invoice_repo import InvoiceRepository
from app.repositories.transaction_repo import ReconciliationRepository, TransactionRepository
from app.schemas.dashboard import (
    CashFlowPoint,
    CashFlowResponse,
    DashboardAlert,
    DashboardOverview,
    KPIs,
    RecentTransaction,
    ReconciliationHealth,
)


def _month_start(d: date) -> date:
    return d.replace(day=1)


def _prev_month_start(d: date) -> date:
    first = _month_start(d)
    return (first - timedelta(days=1)).replace(day=1)


def _prev_month_end(d: date) -> date:
    return _month_start(d) - timedelta(days=1)


def _pct_change(current: float, previous: float) -> float | None:
    if previous == 0:
        return None
    return round(((current - previous) / previous) * 100, 1)


class DashboardService:
    def __init__(self, db: AsyncSession) -> None:
        self.invoices = InvoiceRepository(db)
        self.transactions = TransactionRepository(db)
        self.reconciliation = ReconciliationRepository(db)

    async def get_overview(self, business_id: UUID) -> DashboardOverview:
        today = date.today()
        month_start = _month_start(today)
        prev_start = _prev_month_start(today)
        prev_end = _prev_month_end(today)

        # Current month revenue = credits (receivable invoice payments received)
        revenue_mtd = await self.transactions.sum_by_type_and_period(
            business_id, "credit", month_start, today
        )
        expenses_mtd = await self.transactions.sum_by_type_and_period(
            business_id, "debit", month_start, today
        )

        # Prior month for trend calculation
        revenue_prev = await self.transactions.sum_by_type_and_period(
            business_id, "credit", prev_start, prev_end
        )
        expenses_prev = await self.transactions.sum_by_type_and_period(
            business_id, "debit", prev_start, prev_end
        )

        overdue = await self.invoices.get_overdue(business_id, today)
        overdue_amount = sum(float(inv.total_amount) - float(inv.paid_amount) for inv in overdue)

        bank_balance = await self.transactions.get_current_balance(business_id)

        recon_stats = await self.reconciliation.get_health_stats(business_id)

        kpis = KPIs(
            total_revenue_mtd=revenue_mtd,
            total_expenses_mtd=expenses_mtd,
            net_profit_mtd=revenue_mtd - expenses_mtd,
            overdue_invoices_count=len(overdue),
            overdue_invoices_amount=overdue_amount,
            current_bank_balance=bank_balance,
            pending_reconciliation=recon_stats["pending"],
            revenue_change_pct=_pct_change(revenue_mtd, revenue_prev),
            expense_change_pct=_pct_change(expenses_mtd, expenses_prev),
        )

        alerts: list[DashboardAlert] = []
        for inv in sorted(overdue, key=lambda i: float(i.total_amount), reverse=True)[:5]:
            days_overdue = (today - inv.due_date).days if inv.due_date else 0
            amount_due = float(inv.total_amount) - float(inv.paid_amount)
            alerts.append(
                DashboardAlert(
                    type="overdue_invoice",
                    severity="high" if days_overdue > 14 else "medium",
                    message=f"Invoice {inv.invoice_number} from {inv.vendor_name} is {days_overdue}d overdue",
                    invoice_id=inv.id,
                    amount=amount_due,
                )
            )

        if recon_stats["exceptions"] > 0:
            alerts.append(
                DashboardAlert(
                    type="reconciliation_exception",
                    severity="medium",
                    message=f"{recon_stats['exceptions']} unresolved reconciliation exception{'s' if recon_stats['exceptions'] > 1 else ''}",
                )
            )

        recent_txns = await self.transactions.get_recent(business_id, limit=8)
        recent = [
            RecentTransaction(
                id=t.id,
                date=t.transaction_date,
                description=t.description,
                amount=float(t.amount),
                type=t.type,
                category=t.category,
                reference=t.reference,
            )
            for t in recent_txns
        ]

        total = recon_stats["total"]
        confirmed = recon_stats["confirmed"]
        matched_pct = round((confirmed / total * 100), 1) if total > 0 else 0.0

        health = ReconciliationHealth(
            matched_pct=matched_pct,
            unmatched_count=recon_stats["pending"],
            exceptions_count=recon_stats["exceptions"],
            total_matched=confirmed,
            total_items=total,
        )

        return DashboardOverview(
            kpis=kpis,
            alerts=alerts,
            recent_transactions=recent,
            reconciliation_health=health,
        )

    async def get_cash_flow(self, business_id: UUID, days: int = 30) -> CashFlowResponse:
        today = date.today()
        start = today - timedelta(days=days - 1)

        daily_rows = await self.transactions.get_daily_flow(business_id, start, today)

        # Index by (date, type)
        flow_map: dict[date, dict[str, float]] = {}
        for tx_date, tx_type, total in daily_rows:
            if tx_date not in flow_map:
                flow_map[tx_date] = {"credit": 0.0, "debit": 0.0}
            flow_map[tx_date][tx_type] = total

        # Compute running balance starting from balance at period start
        balance_at_start = await self._balance_before(business_id, start)
        running_balance = balance_at_start

        points: list[CashFlowPoint] = []
        current = start
        while current <= today:
            day_data = flow_map.get(current, {"credit": 0.0, "debit": 0.0})
            inflow = day_data.get("credit", 0.0)
            outflow = day_data.get("debit", 0.0)
            running_balance = running_balance + inflow - outflow
            points.append(
                CashFlowPoint(
                    date=current,
                    inflows=inflow,
                    outflows=outflow,
                    net=inflow - outflow,
                    balance=running_balance,
                )
            )
            current += timedelta(days=1)

        total_in = sum(p.inflows for p in points)
        total_out = sum(p.outflows for p in points)

        return CashFlowResponse(
            points=points,
            period_days=days,
            total_inflows=total_in,
            total_outflows=total_out,
            opening_balance=balance_at_start,
            closing_balance=running_balance,
        )

    async def _balance_before(self, business_id: UUID, before: date) -> float:
        from datetime import date as dt
        credits = await self.transactions.sum_by_type_and_period(
            business_id, "credit", dt(2000, 1, 1), before - timedelta(days=1)
        )
        debits = await self.transactions.sum_by_type_and_period(
            business_id, "debit", dt(2000, 1, 1), before - timedelta(days=1)
        )
        from sqlalchemy import func, select
        from app.models.bank_account import BankAccount
        from sqlalchemy.ext.asyncio import AsyncSession
        return credits - debits

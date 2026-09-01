from datetime import date
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_account import BankAccount
from app.models.reconciliation import ReconciliationMatch
from app.models.transaction import Transaction
from app.repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Transaction, db)

    async def get_recent(self, business_id: UUID, limit: int = 10) -> list[Transaction]:
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.business_id == business_id)
            .order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def sum_by_type_and_period(
        self, business_id: UUID, tx_type: str, start: date, end: date
    ) -> float:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                and_(
                    Transaction.business_id == business_id,
                    Transaction.type == tx_type,
                    Transaction.transaction_date >= start,
                    Transaction.transaction_date <= end,
                )
            )
        )
        return float(result.scalar_one())

    async def get_daily_flow(
        self, business_id: UUID, start: date, end: date
    ) -> list[tuple[date, str, float]]:
        """Returns (date, type, sum_amount) grouped by date and type."""
        result = await self.db.execute(
            select(
                Transaction.transaction_date,
                Transaction.type,
                func.sum(Transaction.amount).label("total"),
            )
            .where(
                and_(
                    Transaction.business_id == business_id,
                    Transaction.transaction_date >= start,
                    Transaction.transaction_date <= end,
                )
            )
            .group_by(Transaction.transaction_date, Transaction.type)
            .order_by(Transaction.transaction_date)
        )
        return [(row.transaction_date, row.type, float(row.total)) for row in result]

    async def get_current_balance(self, business_id: UUID) -> float:
        """Latest recorded balance across all bank accounts for this business."""
        subq = (
            select(
                Transaction.bank_account_id,
                func.max(Transaction.transaction_date).label("last_date"),
            )
            .join(BankAccount, BankAccount.id == Transaction.bank_account_id)
            .where(
                and_(
                    Transaction.business_id == business_id,
                    Transaction.balance.isnot(None),
                )
            )
            .group_by(Transaction.bank_account_id)
            .subquery()
        )

        result = await self.db.execute(
            select(func.coalesce(func.sum(Transaction.balance), 0))
            .join(
                subq,
                and_(
                    Transaction.bank_account_id == subq.c.bank_account_id,
                    Transaction.transaction_date == subq.c.last_date,
                ),
            )
            .where(Transaction.business_id == business_id)
        )
        balance = result.scalar_one()

        if not balance:
            # Fall back to sum of bank account opening balances + net transactions
            accounts_result = await self.db.execute(
                select(func.coalesce(func.sum(BankAccount.opening_balance), 0)).where(
                    BankAccount.business_id == business_id
                )
            )
            opening = float(accounts_result.scalar_one())

            credits = await self.sum_by_type_and_period(
                business_id, "credit", date(2000, 1, 1), date.today()
            )
            debits = await self.sum_by_type_and_period(
                business_id, "debit", date(2000, 1, 1), date.today()
            )
            return opening + credits - debits

        return float(balance)


class ReconciliationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_health_stats(self, business_id: UUID) -> dict:
        total_result = await self.db.execute(
            select(func.count()).select_from(ReconciliationMatch).where(
                ReconciliationMatch.business_id == business_id
            )
        )
        total = total_result.scalar_one()

        confirmed_result = await self.db.execute(
            select(func.count()).select_from(ReconciliationMatch).where(
                and_(
                    ReconciliationMatch.business_id == business_id,
                    ReconciliationMatch.status == "confirmed",
                )
            )
        )
        confirmed = confirmed_result.scalar_one()

        pending_result = await self.db.execute(
            select(func.count()).select_from(ReconciliationMatch).where(
                and_(
                    ReconciliationMatch.business_id == business_id,
                    ReconciliationMatch.status == "pending",
                )
            )
        )
        pending = pending_result.scalar_one()

        from app.models.reconciliation import ReconciliationException

        exceptions_result = await self.db.execute(
            select(func.count()).select_from(ReconciliationException).where(
                and_(
                    ReconciliationException.business_id == business_id,
                    ReconciliationException.is_resolved == False,  # noqa: E712
                )
            )
        )
        exceptions = exceptions_result.scalar_one()

        return {
            "total": total,
            "confirmed": confirmed,
            "pending": pending,
            "exceptions": exceptions,
        }

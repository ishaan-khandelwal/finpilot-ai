from datetime import date
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.invoice import Invoice
from app.repositories.base import BaseRepository


class InvoiceRepository(BaseRepository[Invoice]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Invoice, db)

    async def get_by_business(
        self,
        business_id: UUID,
        status: str | None = None,
        invoice_type: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Invoice]:
        q = select(Invoice).where(Invoice.business_id == business_id)
        if status:
            q = q.where(Invoice.status == status)
        if invoice_type:
            q = q.where(Invoice.invoice_type == invoice_type)
        q = q.order_by(Invoice.invoice_date.desc()).limit(limit).offset(offset)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def count_by_business(self, business_id: UUID, status: str | None = None) -> int:
        q = select(func.count()).select_from(Invoice).where(Invoice.business_id == business_id)
        if status:
            q = q.where(Invoice.status == status)
        result = await self.db.execute(q)
        return result.scalar_one()

    async def get_overdue(self, business_id: UUID, as_of: date) -> list[Invoice]:
        result = await self.db.execute(
            select(Invoice).where(
                and_(
                    Invoice.business_id == business_id,
                    or_(
                        Invoice.status == "overdue",
                        and_(
                            Invoice.status == "unpaid",
                            Invoice.due_date < as_of,
                        ),
                    ),
                )
            )
        )
        return list(result.scalars().all())

    async def sum_amount_by_period(
        self, business_id: UUID, start: date, end: date, invoice_type: str = "receivable"
    ) -> float:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Invoice.total_amount), 0)).where(
                and_(
                    Invoice.business_id == business_id,
                    Invoice.invoice_type == invoice_type,
                    Invoice.invoice_date >= start,
                    Invoice.invoice_date <= end,
                )
            )
        )
        return float(result.scalar_one())

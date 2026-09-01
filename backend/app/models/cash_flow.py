import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.business import Business


class CashFlowEntry(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "cash_flow_entries"
    __table_args__ = (UniqueConstraint("business_id", "entry_date", "period_type"),)

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    period_type: Mapped[str] = mapped_column(String(10), nullable=False, default="daily")
    opening_balance: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    inflows: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    outflows: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    net_cash_flow: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    closing_balance: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    inflow_breakdown: Mapped[dict | None] = mapped_column(JSONB)
    outflow_breakdown: Mapped[dict | None] = mapped_column(JSONB)

    business: Mapped["Business"] = relationship("Business")

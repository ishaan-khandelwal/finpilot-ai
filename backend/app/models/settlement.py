import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.reconciliation import ReconciliationMatch


class Settlement(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "settlements"
    __table_args__ = (UniqueConstraint("business_id", "settlement_id"),)

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL")
    )
    settlement_id: Mapped[str] = mapped_column(String(100), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="razorpay")
    settlement_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    utr: Mapped[str | None] = mapped_column(String(50))
    gross_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    fee_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    tax_on_fee: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    net_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    transaction_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    raw_data: Mapped[dict | None] = mapped_column(JSONB)

    business: Mapped["Business"] = relationship("Business")
    reconciliation_matches: Mapped[list["ReconciliationMatch"]] = relationship(
        "ReconciliationMatch", back_populates="settlement"
    )

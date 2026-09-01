import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ARRAY, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.invoice import Invoice
    from app.models.settlement import Settlement
    from app.models.transaction import Transaction
    from app.models.user import User


class ReconciliationMatch(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reconciliation_matches"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    invoice_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="SET NULL"), index=True
    )
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL")
    )
    settlement_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("settlements.id", ondelete="SET NULL")
    )
    match_type: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    matched_by: Mapped[str] = mapped_column(String(10), nullable=False, default="ai")
    mismatch_reasons: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    notes: Mapped[str | None] = mapped_column(Text)
    confirmed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    business: Mapped["Business"] = relationship("Business")
    invoice: Mapped["Invoice | None"] = relationship("Invoice", back_populates="reconciliation_matches")
    transaction: Mapped["Transaction | None"] = relationship(
        "Transaction", back_populates="reconciliation_matches"
    )
    settlement: Mapped["Settlement | None"] = relationship(
        "Settlement", back_populates="reconciliation_matches"
    )
    confirmer: Mapped["User | None"] = relationship("User", foreign_keys=[confirmed_by])


class ReconciliationException(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reconciliation_exceptions"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    exception_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(10), nullable=False, default="medium")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    invoice_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoices.id")
    )
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transactions.id")
    )
    settlement_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("settlements.id")
    )
    amount: Mapped[float | None] = mapped_column(Numeric(15, 2))
    is_resolved: Mapped[bool] = mapped_column(nullable=False, default=False, index=True)
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolution_note: Mapped[str | None] = mapped_column(Text)

    business: Mapped["Business"] = relationship("Business")

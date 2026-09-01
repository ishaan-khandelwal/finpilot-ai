import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.document import Document
    from app.models.invoice_line_item import InvoiceLineItem
    from app.models.reconciliation import ReconciliationMatch


class Invoice(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "invoices"
    __table_args__ = (UniqueConstraint("business_id", "invoice_number"),)

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True
    )
    invoice_number: Mapped[str] = mapped_column(String(100), nullable=False)
    invoice_type: Mapped[str] = mapped_column(String(20), nullable=False, default="receivable")
    vendor_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    vendor_gstin: Mapped[str | None] = mapped_column(String(15))
    buyer_name: Mapped[str | None] = mapped_column(String(255))
    buyer_gstin: Mapped[str | None] = mapped_column(String(15))
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, index=True)
    subtotal: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    cgst_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    sgst_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    igst_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    tds_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    paid_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="unpaid", index=True)
    ocr_confidence: Mapped[float | None] = mapped_column(Numeric(5, 4))
    raw_ocr_data: Mapped[dict | None] = mapped_column(JSONB)
    notes: Mapped[str | None] = mapped_column(Text)

    business: Mapped["Business"] = relationship("Business", back_populates="invoices")
    document: Mapped["Document | None"] = relationship("Document", back_populates="invoices")
    line_items: Mapped[list["InvoiceLineItem"]] = relationship(
        "InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan"
    )
    reconciliation_matches: Mapped[list["ReconciliationMatch"]] = relationship(
        "ReconciliationMatch", back_populates="invoice"
    )

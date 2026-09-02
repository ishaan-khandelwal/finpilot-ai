from datetime import date
from uuid import UUID

from pydantic import Field

from app.schemas.common import CamelModel, PaginatedResponse


class InvoiceLineItemSchema(CamelModel):
    description: str
    quantity: float
    unit_price: float
    amount: float
    hsn_sac: str | None = None
    cgst_rate: float | None = None
    sgst_rate: float | None = None
    igst_rate: float | None = None


class InvoiceResponse(CamelModel):
    id: UUID
    invoice_number: str
    invoice_type: str
    vendor_name: str
    vendor_gstin: str | None
    buyer_name: str | None
    buyer_gstin: str | None
    invoice_date: date
    due_date: date | None
    subtotal: float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    tds_amount: float
    total_amount: float
    paid_amount: float
    currency: str
    status: str
    ocr_confidence: float | None
    notes: str | None
    created_at: str

    @classmethod
    def from_orm_extended(cls, inv) -> "InvoiceResponse":
        return cls(
            id=inv.id,
            invoice_number=inv.invoice_number,
            invoice_type=inv.invoice_type,
            vendor_name=inv.vendor_name,
            vendor_gstin=inv.vendor_gstin,
            buyer_name=inv.buyer_name,
            buyer_gstin=inv.buyer_gstin,
            invoice_date=inv.invoice_date,
            due_date=inv.due_date,
            subtotal=float(inv.subtotal),
            cgst_amount=float(inv.cgst_amount),
            sgst_amount=float(inv.sgst_amount),
            igst_amount=float(inv.igst_amount),
            tds_amount=float(inv.tds_amount),
            total_amount=float(inv.total_amount),
            paid_amount=float(inv.paid_amount),
            currency=inv.currency,
            status=inv.status,
            ocr_confidence=float(inv.ocr_confidence) if inv.ocr_confidence else None,
            notes=inv.notes,
            created_at=inv.created_at.isoformat(),
        )


class InvoiceStatsResponse(CamelModel):
    total_receivable: float
    total_payable: float
    overdue_count: int
    overdue_amount: float
    paid_this_month: float
    pending_count: int


class DocumentUploadResponse(CamelModel):
    document_id: UUID
    task_id: str
    status: str
    message: str


class TransactionResponse(CamelModel):
    id: UUID
    transaction_date: date
    amount: float
    type: str
    description: str
    reference: str | None
    category: str | None
    counterparty: str | None
    balance: float | None
    created_at: str

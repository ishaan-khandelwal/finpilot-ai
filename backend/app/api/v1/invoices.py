import os
import uuid
from datetime import date
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document
from app.models.user import User
from app.repositories.invoice_repo import InvoiceRepository
from app.schemas.common import PaginatedResponse
from app.schemas.invoice import (
    DocumentUploadResponse,
    InvoiceResponse,
    InvoiceStatsResponse,
)

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("/stats", response_model=InvoiceStatsResponse)
async def get_invoice_stats(
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = InvoiceRepository(db)
    today = date.today()
    month_start = today.replace(day=1)

    overdue = await repo.get_overdue(business_id, today)
    overdue_amount = sum(float(i.total_amount) - float(i.paid_amount) for i in overdue)

    total_receivable = await repo.sum_amount_by_period(
        business_id, date(2000, 1, 1), today, invoice_type="receivable"
    )
    total_payable = await repo.sum_amount_by_period(
        business_id, date(2000, 1, 1), today, invoice_type="payable"
    )
    paid_this_month = await repo.sum_amount_by_period(
        business_id, month_start, today, invoice_type="receivable"
    )
    pending_count = await repo.count_by_business(business_id, status="unpaid")

    return InvoiceStatsResponse(
        total_receivable=total_receivable,
        total_payable=total_payable,
        overdue_count=len(overdue),
        overdue_amount=overdue_amount,
        paid_this_month=paid_this_month,
        pending_count=pending_count,
    )


@router.get("", response_model=PaginatedResponse[InvoiceResponse])
async def list_invoices(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    status: str | None = None,
    invoice_type: str | None = None,
    search: str | None = None,
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = InvoiceRepository(db)
    offset = (page - 1) * limit

    invoices = await repo.get_by_business(
        business_id,
        status=status,
        invoice_type=invoice_type,
        limit=limit,
        offset=offset,
    )
    total = await repo.count_by_business(
        business_id, status=status
    )
    pages = max(1, (total + limit - 1) // limit)

    return PaginatedResponse(
        items=[InvoiceResponse.from_orm_extended(inv) for inv in invoices],
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: UUID,
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = InvoiceRepository(db)
    inv = await repo.get(invoice_id)
    if not inv or inv.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return InvoiceResponse.from_orm_extended(inv)

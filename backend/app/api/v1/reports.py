"""
Reports API — Phase 6

Generates and serves financial reports (P&L, balance sheet, GST summary, etc.).
Stub endpoints ensure the frontend pages don't 404 while Phase 6 is built.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user
from app.core.database import get_db
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["reports"])


class GenerateReportRequest(BaseModel):
    report_type: str  # e.g. "profit_loss", "balance_sheet", "gst_summary", "cash_flow"
    period_start: str | None = None  # ISO date string
    period_end: str | None = None    # ISO date string


class GenerateReportResponse(BaseModel):
    task_id: str
    status: str
    message: str


@router.post("/generate", response_model=GenerateReportResponse, status_code=202)
async def generate_report(
    payload: GenerateReportRequest,
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GenerateReportResponse:
    """Trigger async report generation."""
    try:
        import uuid as _uuid  # noqa: PLC0415
        from app.workers.report_tasks import generate_report  # noqa: PLC0415
        report_id = str(_uuid.uuid4())
        task = generate_report.delay(report_id, str(business_id))
        task_id = task.id
    except Exception:
        task_id = "unavailable"

    return GenerateReportResponse(
        task_id=task_id,
        status="queued",
        message=f"Report '{payload.report_type}' generation queued.",
    )


@router.get("")
async def list_reports(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List generated reports — Phase 6 full implementation coming."""
    return {"items": [], "total": 0, "page": page, "limit": limit, "pages": 0}

"""
Reconciliation API — Phase 5

Manages auto-reconciliation runs and match/exception review.
Stub endpoints ensure the frontend pages don't 404 while Phase 5 is built.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.transaction_repo import ReconciliationRepository

router = APIRouter(prefix="/reconciliation", tags=["reconciliation"])


class ReconciliationStatusResponse(BaseModel):
    status: str
    total: int
    confirmed: int
    pending: int
    exceptions: int
    matched_pct: float


class RunResponse(BaseModel):
    task_id: str
    status: str
    message: str


@router.post("/run", response_model=RunResponse, status_code=202)
async def run_reconciliation(
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RunResponse:
    """Trigger an async reconciliation run for the business."""
    try:
        from app.workers.reconciliation_tasks import run_reconciliation  # noqa: PLC0415
        task = run_reconciliation.delay(str(business_id))
        task_id = task.id
    except Exception:
        task_id = "unavailable"

    return RunResponse(
        task_id=task_id,
        status="queued",
        message="Reconciliation job queued. Results will appear shortly.",
    )


@router.get("/status", response_model=ReconciliationStatusResponse)
async def get_status(
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReconciliationStatusResponse:
    """Return reconciliation health stats for the business."""
    repo = ReconciliationRepository(db)
    stats = await repo.get_health_stats(business_id)
    total = stats["total"]
    confirmed = stats["confirmed"]
    return ReconciliationStatusResponse(
        status="ok",
        total=total,
        confirmed=confirmed,
        pending=stats["pending"],
        exceptions=stats["exceptions"],
        matched_pct=round(confirmed / total * 100, 1) if total > 0 else 0.0,
    )


@router.get("/matches")
async def list_matches(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=25, ge=1, le=100),
    status: str | None = None,
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List reconciliation matches — Phase 5 full implementation coming."""
    return {"items": [], "total": 0, "page": page, "limit": limit, "pages": 0}


@router.get("/exceptions")
async def list_exceptions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=25, ge=1, le=100),
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List reconciliation exceptions — Phase 5 full implementation coming."""
    return {"items": [], "total": 0, "page": page, "limit": limit, "pages": 0}

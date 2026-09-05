"""
Forecasts API — Phase 5

Generates and retrieves 90-day cash flow and revenue forecasts.
Stub endpoints ensure the frontend pages don't 404 while Phase 5 is built.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user
from app.core.database import get_db
from app.models.user import User

router = APIRouter(prefix="/forecasts", tags=["forecasts"])


class GenerateForecastResponse(BaseModel):
    task_id: str
    status: str
    message: str


@router.post("/generate", response_model=GenerateForecastResponse, status_code=202)
async def generate_forecast(
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GenerateForecastResponse:
    """Trigger async 90-day cash flow forecast generation."""
    try:
        from app.workers.forecast_tasks import generate_forecast  # noqa: PLC0415
        task = generate_forecast.delay(str(business_id))
        task_id = task.id
    except Exception:
        task_id = "unavailable"

    return GenerateForecastResponse(
        task_id=task_id,
        status="queued",
        message="Forecast generation queued. This may take up to 30 seconds.",
    )


@router.get("/latest")
async def get_latest_forecast(
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the most recent forecast — Phase 5 full implementation coming."""
    return {
        "forecast": None,
        "message": "No forecast generated yet. Click 'Generate Forecast' to run the 90-day model.",
    }


@router.get("")
async def list_forecasts(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List historical forecasts — Phase 5 full implementation coming."""
    return {"items": [], "total": 0, "page": page, "limit": limit, "pages": 0}

from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.dashboard import CashFlowResponse, DashboardOverview
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardOverview)
async def get_overview(
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService(db).get_overview(business_id)


@router.get("/cash-flow", response_model=CashFlowResponse)
async def get_cash_flow(
    days: Literal[7, 30, 90] = Query(default=30, description="Period in days"),
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService(db).get_cash_flow(business_id, days=days)

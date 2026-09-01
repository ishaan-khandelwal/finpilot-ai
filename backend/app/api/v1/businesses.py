from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.repositories.business_repo import BusinessRepository
from app.schemas.business import BusinessResponse, BusinessUpdate
from fastapi import HTTPException, status

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.get("/me", response_model=BusinessResponse)
async def get_my_business(
    business_id: UUID = Depends(get_current_business_id),
    db: AsyncSession = Depends(get_db),
):
    repo = BusinessRepository(db)
    business = await repo.get(business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return BusinessResponse.model_validate(business)


@router.patch("/me", response_model=BusinessResponse)
async def update_my_business(
    payload: BusinessUpdate,
    current_user: User = Depends(require_role("owner", "accountant")),
    business_id: UUID = Depends(get_current_business_id),
    db: AsyncSession = Depends(get_db),
):
    repo = BusinessRepository(db)
    business = await repo.get(business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(business, field, value)

    db.add(business)
    await db.flush()
    await db.refresh(business)
    return BusinessResponse.model_validate(business)

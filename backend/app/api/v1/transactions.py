from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.common import PaginatedResponse
from app.schemas.invoice import TransactionResponse

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=PaginatedResponse[TransactionResponse])
async def list_transactions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=25, ge=1, le=100),
    type: str | None = None,
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import and_, select
    from app.models.transaction import Transaction

    repo = TransactionRepository(db)
    q = select(Transaction).where(Transaction.business_id == business_id)
    if type:
        q = q.where(Transaction.type == type)
    q = q.order_by(Transaction.transaction_date.desc()).limit(limit).offset((page - 1) * limit)
    result = await db.execute(q)
    items = list(result.scalars().all())

    from sqlalchemy import func
    count_q = select(func.count()).select_from(Transaction).where(Transaction.business_id == business_id)
    if type:
        count_q = count_q.where(Transaction.type == type)
    total_result = await db.execute(count_q)
    total = total_result.scalar_one()
    pages = max(1, (total + limit - 1) // limit)

    response_items = [
        TransactionResponse(
            id=t.id,
            transaction_date=t.transaction_date,
            amount=float(t.amount),
            type=t.type,
            description=t.description,
            reference=t.reference,
            category=t.category,
            counterparty=t.counterparty,
            balance=float(t.balance) if t.balance is not None else None,
            created_at=t.created_at.isoformat(),
        )
        for t in items
    ]

    return PaginatedResponse(items=response_items, total=total, page=page, limit=limit, pages=pages)

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business import Business, BusinessMember
from app.models.refresh_token import RefreshToken
from app.repositories.base import BaseRepository


class BusinessRepository(BaseRepository[Business]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Business, db)

    async def get_by_owner(self, owner_id: UUID) -> Business | None:
        result = await self.db.execute(
            select(Business).where(Business.owner_id == owner_id)
        )
        return result.scalar_one_or_none()

    async def get_for_user(self, user_id: UUID) -> list[Business]:
        result = await self.db.execute(
            select(Business)
            .join(BusinessMember, BusinessMember.business_id == Business.id)
            .where(BusinessMember.user_id == user_id)
        )
        return list(result.scalars().all())


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(RefreshToken, db)

    async def get_by_hash(self, token_hash: str) -> RefreshToken | None:
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def revoke(self, token_hash: str) -> None:
        await self.db.execute(
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await self.db.flush()

    async def revoke_all_for_user(self, user_id: UUID) -> None:
        await self.db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await self.db.flush()

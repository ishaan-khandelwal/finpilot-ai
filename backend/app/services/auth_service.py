import hashlib
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    token_expires_at,
    verify_password,
)
from app.core.config import settings
from app.models.business import Business, BusinessMember
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.repositories.business_repo import BusinessRepository, RefreshTokenRepository
from app.repositories.user_repo import UserRepository
from app.schemas.auth import RegisterRequest, TokenResponse, UserProfile, BusinessSummary


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _build_token_response(
    user: User, business: Business | None, access_token: str, refresh_token: str
) -> TokenResponse:
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserProfile.model_validate(user),
        business=BusinessSummary.model_validate(business) if business else None,
    )


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.businesses = BusinessRepository(db)
        self.tokens = RefreshTokenRepository(db)

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        if await self.users.exists_by_email(payload.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        user = User(
            email=payload.email.lower(),
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
            role="owner",
        )
        user = await self.users.create(user)

        business = Business(
            owner_id=user.id,
            name=payload.business_name,
            gstin=payload.gstin,
        )
        business = await self.businesses.create(business)

        member = BusinessMember(
            business_id=business.id,
            user_id=user.id,
            role="owner",
            invited_at=datetime.now(timezone.utc),
            accepted_at=datetime.now(timezone.utc),
        )
        self.db.add(member)
        await self.db.flush()

        return await self._issue_tokens(user, business)

    async def login(self, email: str, password: str, device_info: str | None = None) -> TokenResponse:
        user = await self.users.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled",
            )

        await self.users.update_last_login(user.id)
        business = await self.businesses.get_by_owner(user.id)
        return await self._issue_tokens(user, business, device_info)

    async def refresh(self, raw_refresh_token: str) -> TokenResponse:
        token_hash = _hash_token(raw_refresh_token)
        stored = await self.tokens.get_by_hash(token_hash)

        if not stored or not stored.is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token is invalid or expired",
            )

        # Rotate: revoke old, issue new
        await self.tokens.revoke(token_hash)

        user = await self.users.get(stored.user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        business = await self.businesses.get_by_owner(user.id)
        return await self._issue_tokens(user, business)

    async def logout(self, raw_refresh_token: str) -> None:
        token_hash = _hash_token(raw_refresh_token)
        await self.tokens.revoke(token_hash)

    async def _issue_tokens(
        self,
        user: User,
        business: Business | None,
        device_info: str | None = None,
    ) -> TokenResponse:
        access_token = create_access_token(user.id, business.id if business else None)
        raw_refresh = create_refresh_token(user.id)

        stored_token = RefreshToken(
            user_id=user.id,
            token_hash=_hash_token(raw_refresh),
            expires_at=token_expires_at(days=settings.refresh_token_expire_days),
            device_info=device_info,
        )
        await self.tokens.create(stored_token)

        return _build_token_response(user, business, access_token, raw_refresh)

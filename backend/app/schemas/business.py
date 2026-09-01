from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import CamelModel


class BusinessCreate(CamelModel):
    name: str = Field(min_length=2, max_length=255)
    gstin: str | None = None
    pan: str | None = None
    registered_address: str | None = None
    industry: str | None = None
    fiscal_year_start: int = Field(default=4, ge=1, le=12)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    timezone: str = "Asia/Kolkata"


class BusinessUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    gstin: str | None = None
    pan: str | None = None
    registered_address: str | None = None
    industry: str | None = None
    timezone: str | None = None


class BusinessResponse(CamelModel):
    id: UUID
    owner_id: UUID
    name: str
    gstin: str | None
    pan: str | None
    registered_address: str | None
    industry: str | None
    fiscal_year_start: int
    currency: str
    timezone: str
    created_at: datetime
    updated_at: datetime


class MemberInviteRequest(CamelModel):
    email: str
    role: str = Field(default="viewer", pattern=r"^(accountant|viewer)$")

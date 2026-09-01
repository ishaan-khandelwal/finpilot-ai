import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.user import User


class Forecast(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "forecasts"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    generated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    forecast_type: Mapped[str] = mapped_column(String(5), nullable=False, default="30d")
    forecast_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    predicted_inflow: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    predicted_outflow: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    predicted_balance: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    confidence_lower: Mapped[float | None] = mapped_column(Numeric(15, 2))
    confidence_upper: Mapped[float | None] = mapped_column(Numeric(15, 2))
    model_used: Mapped[str | None] = mapped_column(String(100))
    assumptions: Mapped[dict | None] = mapped_column(JSONB)
    explanation: Mapped[str | None] = mapped_column(Text)
    actuals_recorded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    actual_balance: Mapped[float | None] = mapped_column(Numeric(15, 2))

    business: Mapped["Business"] = relationship("Business")
    generator: Mapped["User | None"] = relationship("User", foreign_keys=[generated_by])

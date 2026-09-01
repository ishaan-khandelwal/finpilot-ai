import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

try:
    from pgvector.sqlalchemy import Vector
    VECTOR_TYPE = Vector(768)
except ImportError:
    from sqlalchemy import JSON
    VECTOR_TYPE = JSON  # type: ignore[assignment]

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.document import Document


class DocumentEmbedding(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "document_embeddings"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(VECTOR_TYPE)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB)

    business: Mapped["Business"] = relationship("Business")
    document: Mapped["Document"] = relationship("Document")

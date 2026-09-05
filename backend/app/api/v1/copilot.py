"""
Copilot API — Phase 4

Handles AI financial Q&A via Google Gemini + RAG over uploaded business documents.
Currently returns a structured stub so the frontend copilot page works end-to-end.
"""
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user
from app.core.database import get_db
from app.models.user import User

router = APIRouter(prefix="/copilot", tags=["copilot"])


class CopilotChatRequest(BaseModel):
    question: str
    conversation_id: str | None = None


class CopilotChatResponse(BaseModel):
    answer: str
    conversation_id: str
    sources: list[str]


@router.post("/chat", response_model=CopilotChatResponse)
async def chat(
    payload: CopilotChatRequest,
    business_id: UUID = Depends(get_current_business_id),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CopilotChatResponse:
    """
    Phase 4 stub — full Gemini RAG implementation coming.
    Returns a structured placeholder so the frontend works without errors.
    """
    import uuid as _uuid

    conv_id = payload.conversation_id or str(_uuid.uuid4())
    return CopilotChatResponse(
        answer=(
            "The AI Financial Copilot is being set up for your business. "
            "Full Gemini-powered Q&A with document RAG will be available in Phase 4. "
            "In the meantime the demo mode provides rich sample responses."
        ),
        conversation_id=conv_id,
        sources=["FinPilot AI (Phase 4 — coming soon)"],
    )

import os
import uuid
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_business_id, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.invoice import DocumentUploadResponse
from app.workers.ocr_tasks import process_document

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_MIME = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
}

ALLOWED_DOC_TYPES = {
    "invoice", "bank_statement", "gst_report", "razorpay_settlement", "transaction_csv"
}


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    business_id: UUID = Depends(get_current_business_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if document_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"document_type must be one of: {', '.join(ALLOWED_DOC_TYPES)}",
        )

    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Upload PDF, image, Excel, or CSV.",
        )

    contents = await file.read()
    if len(contents) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.max_upload_size_mb}MB",
        )

    # Persist to disk
    upload_path = Path(settings.upload_dir) / str(business_id)
    upload_path.mkdir(parents=True, exist_ok=True)
    doc_id = uuid.uuid4()
    ext = Path(file.filename or "file").suffix
    file_path = upload_path / f"{doc_id}{ext}"
    file_path.write_bytes(contents)

    doc = Document(
        id=doc_id,
        business_id=business_id,
        uploaded_by=current_user.id,
        file_name=file.filename or f"{doc_id}{ext}",
        file_path=str(file_path),
        file_size=len(contents),
        mime_type=file.content_type,
        document_type=document_type,
        status="pending",
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc)

    # Enqueue OCR task
    task = process_document.delay(str(doc_id), str(business_id))

    return DocumentUploadResponse(
        document_id=doc.id,
        task_id=task.id,
        status="pending",
        message="Document uploaded. Processing will begin shortly.",
    )

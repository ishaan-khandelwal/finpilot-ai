"""
Invoice Agent — Phase 4

Processes a raw uploaded document and extracts structured invoice data
using Google Gemini Vision. Called by the OCR Celery task.
"""
import structlog

log = structlog.get_logger()


class InvoiceAgent:
    async def process(self, document_id: str, business_id: str) -> dict:
        """
        Phase 4 placeholder — full Gemini Vision OCR implementation coming.
        Returns a stub result so uploads don't crash the Celery worker.
        """
        log.info("invoice_agent.stub", document_id=document_id, business_id=business_id)
        return {
            "status": "stub",
            "document_id": document_id,
            "business_id": business_id,
            "message": "Invoice OCR agent not yet implemented (Phase 4).",
        }

"""
Invoice Agent — Phase 4

Processes a raw uploaded document and extracts structured invoice data
using Google Gemini Vision. Called by the OCR Celery task.
"""


class InvoiceAgent:
    async def process(self, document_id: str, business_id: str) -> dict:
        raise NotImplementedError("Invoice Agent implemented in Phase 4")

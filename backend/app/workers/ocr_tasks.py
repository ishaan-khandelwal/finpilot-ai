from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="app.workers.ocr_tasks.process_document")
def process_document(self, document_id: str, business_id: str) -> dict:
    """Triggered when a document is uploaded. Dispatches to the Invoice Agent."""
    from app.agents.invoice_agent import InvoiceAgent
    import asyncio

    async def _run():
        agent = InvoiceAgent()
        return await agent.process(document_id=document_id, business_id=business_id)

    return asyncio.run(_run())

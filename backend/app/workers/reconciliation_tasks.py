from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="app.workers.reconciliation_tasks.run_reconciliation")
def run_reconciliation(self, business_id: str) -> dict:
    from app.agents.reconciliation_agent import ReconciliationAgent
    import asyncio
    return asyncio.run(ReconciliationAgent().run(business_id=business_id))

from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="app.workers.report_tasks.generate_report")
def generate_report(self, report_id: str, business_id: str) -> dict:
    from app.agents.reporting_agent import ReportingAgent
    import asyncio
    return asyncio.run(ReportingAgent().generate(report_id=report_id, business_id=business_id))

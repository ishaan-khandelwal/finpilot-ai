from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "finpilot",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        "app.workers.ocr_tasks",
        "app.workers.reconciliation_tasks",
        "app.workers.forecast_tasks",
        "app.workers.report_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "weekly-forecast": {
            "task": "app.workers.forecast_tasks.generate_forecasts_for_all_businesses",
            "schedule": 604800,  # 7 days in seconds
        },
    },
)

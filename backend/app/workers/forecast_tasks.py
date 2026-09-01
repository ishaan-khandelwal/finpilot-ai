from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="app.workers.forecast_tasks.generate_forecast")
def generate_forecast(self, business_id: str, forecast_type: str = "90d") -> dict:
    from app.agents.forecast_agent import ForecastAgent
    import asyncio
    return asyncio.run(ForecastAgent().generate(business_id=business_id, forecast_type=forecast_type))


@celery_app.task(name="app.workers.forecast_tasks.generate_forecasts_for_all_businesses")
def generate_forecasts_for_all_businesses() -> None:
    from app.agents.forecast_agent import ForecastAgent
    import asyncio
    asyncio.run(ForecastAgent().run_for_all_businesses())

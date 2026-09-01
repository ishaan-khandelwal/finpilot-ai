class ForecastAgent:
    async def generate(self, business_id: str, forecast_type: str = "90d") -> dict:
        raise NotImplementedError("Forecast Agent implemented in Phase 6")

    async def run_for_all_businesses(self) -> None:
        raise NotImplementedError("Forecast Agent implemented in Phase 6")

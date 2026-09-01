from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "FinPilot AI"
    app_env: Literal["development", "staging", "production"] = "development"
    secret_key: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    allowed_origins: list[str] = ["http://localhost:3000"]

    database_url: str
    redis_url: str
    redis_password: str = ""

    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 50

    google_api_key: str = ""
    embedding_model: str = "models/embedding-001"
    gemini_model: str = "gemini-1.5-pro"

    celery_broker_url: str
    celery_result_backend: str

    rate_limit_per_minute: int = 100

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

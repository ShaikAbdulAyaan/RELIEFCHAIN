import os
from functools import lru_cache
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RELIEFCHAIN AI Engine"
    app_version: str = "1.1.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    host: str = "0.0.0.0"
    port: int = 8001

    ai_service_api_key: str = Field(default="reliefchain_test_secure_key_2026", min_length=8)
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    location_threshold_km: float = Field(default=50.0, gt=0)
    resource_reference_distance_km: float = Field(default=100.0, gt=0)
    timing_start_hour: int = Field(default=6, ge=0, le=23)
    timing_end_hour: int = Field(default=22, ge=0, le=23)
    max_batch_size: int = Field(default=1000, ge=1, le=10000)
    max_history_size: int = Field(default=10000, ge=100, le=100000)
    dashboard_alert_limit: int = Field(default=100, ge=1, le=1000)
    model_min_history: int = Field(default=12, ge=12, le=10000)
    default_daily_units_per_person: float = Field(default=0.5, gt=0)
    max_expected_units_per_person_per_period: float = Field(default=100.0, gt=0)
    allow_docs: bool = True
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=(".env", ".e-n-v"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("environment", "log_level", mode="before")
    @classmethod
    def normalize_simple_strings(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("ai_service_api_key")
    @classmethod
    def reject_insecure_key(cls, value: str) -> str:
        value = value.strip()
        if os.getenv("ENVIRONMENT") == "testing":
            return value
        if value.lower() in {"change-me", "secret", "password"}:
            raise ValueError("AI_SERVICE_API_KEY must be changed from the development placeholder")
        return value

    @property
    def app_env(self) -> str:
        """Backward-compatible alias for the configured environment."""
        return self.environment

    @property
    def cors_origin_list(self) -> List[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


def get_cors_origins() -> List[str]:
    return settings.cors_origin_list
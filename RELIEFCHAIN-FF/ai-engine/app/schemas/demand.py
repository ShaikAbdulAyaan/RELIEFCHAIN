from pydantic import Field
from .common import APIBaseModel


class DemandPredictionRequest(APIBaseModel):
    item_category: str
    population: int = Field(..., ge=0)
    current_inventory: float = Field(..., ge=0)
    days_forecast: int = Field(default=7, gt=0, le=90)
    disaster_severity: str = Field(..., pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    historical_daily_consumption: list[float] = Field(default_factory=list, max_length=365)
    daily_units_per_person: float | None = Field(default=None, gt=0)


class DemandPredictionResponse(APIBaseModel):
    item_category: str
    estimated_daily_demand: float
    forecast_demand: float
    projected_shortage: float
    days_until_stockout: float | None
    recommendation: str
    method: str

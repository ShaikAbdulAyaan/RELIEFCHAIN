from statistics import mean, median

from app.config import settings
from app.schemas.demand import DemandPredictionRequest, DemandPredictionResponse


SEVERITY_MULTIPLIER = {
    "LOW": 0.90,
    "MEDIUM": 1.00,
    "HIGH": 1.15,
    "CRITICAL": 1.35,
}


class DemandService:
    @staticmethod
    def predict(req: DemandPredictionRequest) -> DemandPredictionResponse:
        historical = [float(x) for x in req.historical_daily_consumption if float(x) >= 0]

        if historical:
            # Median is more robust than mean when disaster-period observations contain spikes.
            base = median(historical)
            method = "HISTORICAL_MEDIAN_WITH_SEVERITY_MULTIPLIER"
        elif req.daily_units_per_person is not None:
            base = req.population * req.daily_units_per_person
            method = "POPULATION_WITH_EXPLICIT_PER_PERSON_RATE"
        else:
            base = req.population * settings.default_daily_units_per_person
            method = "POPULATION_WITH_CONFIGURED_BASELINE_RATE"

        daily = base * SEVERITY_MULTIPLIER[req.disaster_severity]
        forecast = daily * req.days_forecast
        shortage = max(0.0, forecast - req.current_inventory)
        days_until = req.current_inventory / daily if daily > 0 else None

        if shortage > 0:
            recommendation = (
                f"Restock approximately {shortage:.2f} units for the forecast period under the supplied assumptions."
            )
        else:
            recommendation = "Current inventory covers the forecast period under the supplied assumptions."

        if not historical and req.population == 0:
            method = "NO_POPULATION_OR_HISTORY_DATA"
            daily = 0.0
            forecast = 0.0
            shortage = 0.0
            days_until = None
            recommendation = "Insufficient demand inputs: population and historical consumption are unavailable."

        return DemandPredictionResponse(
            item_category=req.item_category,
            estimated_daily_demand=round(daily, 4),
            forecast_demand=round(forecast, 4),
            projected_shortage=round(shortage, 4),
            days_until_stockout=round(days_until, 4) if days_until is not None else None,
            recommendation=recommendation,
            method=method,
        )

from typing import Optional
from pydantic import model_validator
from .common import APIBaseModel


class InventoryRiskRequest(APIBaseModel):
    warehouse_id: str
    item_id: str
    current_quantity: float
    minimum_required: float
    average_consumption_per_day: Optional[float] = None
    incoming_quantity: float = 0.0

    @model_validator(mode="before")
    @classmethod
    def accept_legacy_payload(cls, values):
        if not isinstance(values, dict):
            return values
        v = dict(values)
        aliases = {
            "warehouseId": "warehouse_id",
            "itemCategory": "item_id",
            "currentQuantity": "current_quantity",
            "minimumRequired": "minimum_required",
            "dailyConsumptionRate": "average_consumption_per_day",
            "incomingQuantity": "incoming_quantity",
        }
        for old, new in aliases.items():
            if old in v and new not in v:
                v[new] = v[old]
        return v


class InventoryRiskResponse(APIBaseModel):
    shortage_detected: bool
    shortage_quantity: float
    days_remaining: Optional[float]
    risk_level: str
    restock_recommendation: str
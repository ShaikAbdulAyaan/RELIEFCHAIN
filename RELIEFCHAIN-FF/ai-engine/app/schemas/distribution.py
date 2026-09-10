from typing import List, Optional
from datetime import datetime
from pydantic import model_validator
from .common import APIBaseModel


class DistributionRiskRequest(APIBaseModel):
    camp_id: str
    camp_capacity: int
    expected_consumption_per_capita: float = 0.0
    recorded_distribution_quantity: float = 0.0
    available_inventory: float = 0.0
    item_category: str = "GENERAL"
    historical_quantities: List[float] = []
    time_period_hours: float = 24.0

    @model_validator(mode="before")
    @classmethod
    def accept_legacy_payload(cls, values):
        if not isinstance(values, dict):
            return values
        v = dict(values)
        # Support the older API documented by Member 4 as well as the new API.
        if "expectedDemandKg" in v and "expected_consumption_per_capita" not in v:
            capacity = float(v.get("campCapacity") or 0)
            total = float(v.get("expectedDemandKg") or 0)
            v["expected_consumption_per_capita"] = total / capacity if capacity else 0
        if "recordedDistributionKg" in v:
            v["recorded_distribution_quantity"] = v["recordedDistributionKg"]
        if "inventoryAvailableKg" in v:
            v["available_inventory"] = v["inventoryAvailableKg"]
        if "campCapacity" in v:
            v["camp_capacity"] = v["campCapacity"]
        if "campId" in v:
            v["camp_id"] = v["campId"]
        if "timePeriodHours" in v:
            v["time_period_hours"] = v["timePeriodHours"]
        if "itemCategory" in v:
            v["item_category"] = v["itemCategory"]
        return v


class DistributionRiskResponse(APIBaseModel):
    risk_score: int
    risk_level: str
    expected_quantity: float
    recorded_quantity: float
    difference: float
    reasons: List[str]
    quantity_anomaly_detected: bool
    inventory_available: float = 0.0
    generated_alert: Optional[object] = None


class DistributionCheckRequest(APIBaseModel):
    beneficiary_id: str
    item_category: str
    requested_quantity: float
    current_request_time: datetime
    family_size: int
    last_aid_received_time: Optional[datetime] = None
    last_aid_category: Optional[str] = None
    available_camp_inventory: float
    per_person_allowance: float = 2.0
    cooldown_hours: float = 24.0


class DistributionCheckResponse(APIBaseModel):
    beneficiary_id: str
    eligible: bool
    possible_duplicate: bool
    inventory_available: bool
    quantity_anomaly: bool
    risk_score: int
    risk_level: str
    reasons: List[str]
    recommended_action: str
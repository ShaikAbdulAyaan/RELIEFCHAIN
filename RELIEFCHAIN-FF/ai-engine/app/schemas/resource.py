from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.utils.normalization import to_camel

class LocationCoord(BaseModel):
    latitude: float
    longitude: float

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class WarehouseInventory(BaseModel):
    warehouse_id: str
    location: LocationCoord
    available_inventory: float = 0.0

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class TransportVehicle(BaseModel):
    vehicle_id: str
    capacity: float
    available: bool = True

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class EmergencyRequest(BaseModel):
    camp_id: str
    item_category: str
    requested_quantity: float
    priority: str = "MEDIUM"
    camp_location: LocationCoord
    warehouses: List[WarehouseInventory]
    vehicles: List[TransportVehicle]

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class ResourceMatchResponse(BaseModel):
    camp_id: str
    recommended_warehouse_id: Optional[str] = None
    distance_km: float = 0.0
    recommended_vehicle_id: Optional[str] = None
    fulfilled_quantity: float = 0.0
    status: str
    reasons: List[str]

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
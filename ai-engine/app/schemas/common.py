from pydantic import BaseModel, ConfigDict
from app.utils.normalization import to_camel
from typing import List, Optional

class APIBaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        protected_namespaces=()
    )

class Location(APIBaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    name: Optional[str] = None
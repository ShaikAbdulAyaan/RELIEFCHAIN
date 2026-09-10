from typing import List, Dict, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.utils.normalization import to_camel

class BeneficiaryTarget(BaseModel):
    beneficiary_id: str
    location: str
    family_size: int
    demographics: Optional[Dict[str, Any]] = None
    aid_history: Optional[List[str]] = None

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class DuplicateCheckRequest(BaseModel):
    target: BeneficiaryTarget
    comparison_pool: List[BeneficiaryTarget]

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class DuplicateCheckResponse(BaseModel):
    beneficiary_id: str
    possible_duplicate: bool
    similarity_score: float
    matched_beneficiary_id: Optional[str] = None
    reasons: List[str]

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
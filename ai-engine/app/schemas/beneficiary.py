from typing import List, Optional, Dict
from datetime import datetime
from .common import APIBaseModel

class AidHistory(APIBaseModel):
    distribution_id: str
    category: str
    timestamp: datetime
    location: str

class BeneficiaryCheckRequest(APIBaseModel):
    beneficiary_id: str
    location: str
    family_size: int
    registration_date: datetime
    demographics: Optional[Dict[str, str]] = None
    aid_history: List[AidHistory] = []
    comparison_pool: List[Dict] = []

class DuplicateResponse(APIBaseModel):
    similarity_score: float
    possible_duplicate: bool
    matched_fields: List[str]
    reasons: List[str]
    recommended_action: str
    matched_beneficiary_id: Optional[str] = None
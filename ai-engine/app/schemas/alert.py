from typing import List, Optional
from datetime import datetime
from pydantic import Field
from .common import APIBaseModel

class AIAlert(APIBaseModel):
    alert_type: str = Field(..., description="Category of the alert (e.g., SUSPICIOUS_EXPENSE)")
    severity: str = Field(..., description="CRITICAL, HIGH, MEDIUM")
    entity_type: str = Field(..., description="Type of record flagged (e.g., EXPENSE, BENEFICIARY)")
    entity_id: str = Field(..., description="The ID of the flagged record")
    message: str = Field(..., description="Primary alert description")
    recommended_action: str = Field(..., description="Action required by the Auditor")
    created_at: datetime = Field(default_factory=datetime.utcnow)
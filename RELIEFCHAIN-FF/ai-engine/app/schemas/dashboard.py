from typing import Dict, List, Optional
from datetime import datetime
from pydantic import Field
from .common import APIBaseModel

class AuditEvent(APIBaseModel):
    event_id: str = Field(..., description="Unique identifier for the audited entity (e.g., EXP-101, BEN-992)")
    event_type: str = Field(..., description="Category of the event (EXPENSE, DISTRIBUTION, BENEFICIARY, INVENTORY)")
    risk_score: int = Field(..., ge=0, le=100, description="Calculated AI risk score from 0 to 100")
    risk_level: str = Field(..., description="Categorical risk level: LOW, MEDIUM, HIGH")
    anomalies: List[str] = Field(default_factory=list, description="List of specific anomaly flags detected")
    timestamp: datetime = Field(default_factory=datetime.now, description="Time the analysis was performed")

class DashboardCalculationRequest(APIBaseModel):
    events: List[AuditEvent] = Field(default_factory=list, description="Batch of historical events from Node.js DB")

class DashboardStatsResponse(APIBaseModel):
    total_analyzed: int
    low_risk: int
    medium_risk: int
    high_risk: int
    possible_duplicates: int
    missing_evidence: int
    quantity_anomalies: int
    location_anomalies: int
    timing_anomalies: int
    inventory_shortages: int
    risk_distribution: Dict[str, int]
    anomaly_breakdown_percentage: Dict[str, float]
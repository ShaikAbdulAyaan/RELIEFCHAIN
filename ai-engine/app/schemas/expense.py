from typing import List, Optional
from datetime import datetime

from pydantic import ConfigDict

from .common import APIBaseModel, Location
from .alert import AIAlert
from app.utils.normalization import to_camel


class ExpenseRequest(APIBaseModel):
    expense_id: str
    campaign_id: str
    amount: float
    category: str
    supplier: Optional[str] = None
    timestamp: datetime
    payment_method: Optional[str] = None
    location: Optional[Location] = None
    expected_location: Optional[Location] = None
    evidence_available: bool = False
    historical_expenses: List[float] = []


class ExpenseRiskResponse(APIBaseModel):
    """Risk-analysis response returned by the expense-risk endpoint."""

    expense_id: str
    risk_score: int
    risk_level: str
    reasons: List[str]
    detected_anomalies: List[str]
    recommendation: str
    generated_alert: Optional[AIAlert] = None

    # Keep this response explicitly Pydantic-v2 configured even if the
    # shared APIBaseModel configuration changes later.
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="ignore",
    )

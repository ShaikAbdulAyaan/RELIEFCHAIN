from fastapi import APIRouter, Depends
from app.schemas.distribution import (
    DistributionRiskRequest, DistributionRiskResponse,
    DistributionCheckRequest, DistributionCheckResponse
)
from app.services.distribution_service import DistributionService
from app.services.ledger_service import LedgerService
from app.schemas.dashboard import AuditEvent
from app.dependencies import verify_api_key

router = APIRouter(dependencies=[Depends(verify_api_key)])

@router.post("/distribution-risk", response_model=DistributionRiskResponse, tags=["Anomaly Detection"])
async def check_distribution(req: DistributionRiskRequest):
    """Checks whether bulk camp distribution exceeds capacity or recorded inventory."""
    res = DistributionService.analyze_distribution(req)
    anomalies = []
    if res.quantity_anomaly_detected:
        anomalies.append("QUANTITY_ANOMALY")
    LedgerService.record_event(AuditEvent(
        event_id=req.camp_id,
        event_type="DISTRIBUTION",
        risk_score=res.risk_score,
        risk_level=res.risk_level,
        anomalies=anomalies
    ))
    return res

@router.post("/distribution-check", response_model=DistributionCheckResponse, tags=["Relief Operations"])
async def check_beneficiary_eligibility(req: DistributionCheckRequest):
    """Validates individual beneficiary distribution QR scan for duplicates and entitlement."""
    res = DistributionService.check_beneficiary_distribution(req)
    anomalies = []
    if res.possible_duplicate:
        anomalies.append("DUPLICATE_BENEFICIARY")
    if res.quantity_anomaly:
        anomalies.append("QUANTITY_ANOMALY")
    LedgerService.record_event(AuditEvent(
        event_id=req.beneficiary_id,
        event_type="BENEFICIARY",
        risk_score=res.risk_score,
        risk_level=res.risk_level,
        anomalies=anomalies
    ))
    return res
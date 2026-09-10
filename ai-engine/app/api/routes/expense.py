from fastapi import APIRouter, Depends
from typing import List
from app.schemas.expense import ExpenseRequest, ExpenseRiskResponse
from app.services.expense_service import ExpenseService
from app.services.ledger_service import LedgerService
from app.schemas.dashboard import AuditEvent
from app.dependencies import verify_api_key

router = APIRouter(dependencies=[Depends(verify_api_key)])

@router.post("/expense-risk", response_model=ExpenseRiskResponse, tags=["Anomaly Detection"])
async def analyze_expense(req: ExpenseRequest):
    result = ExpenseService.analyze_expense(req)
    
    # Record real calculation in live ledger
    LedgerService.record_event(AuditEvent(
        event_id=result.expense_id,
        event_type="EXPENSE",
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        anomalies=result.detected_anomalies
    ))
    return result

@router.post("/expense-risk/batch", response_model=List[ExpenseRiskResponse], tags=["Batch Processing"])
async def analyze_expense_batch(reqs: List[ExpenseRequest]):
    results = []
    for req in reqs:
        res = ExpenseService.analyze_expense(req)
        LedgerService.record_event(AuditEvent(
            event_id=res.expense_id,
            event_type="EXPENSE",
            risk_score=res.risk_score,
            risk_level=res.risk_level,
            anomalies=res.detected_anomalies
        ))
        results.append(res)
    return results
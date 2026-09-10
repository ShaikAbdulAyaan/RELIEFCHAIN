from fastapi import APIRouter, Depends
from app.schemas.dashboard import DashboardStatsResponse, DashboardCalculationRequest
from app.services.ledger_service import LedgerService
from app.dependencies import verify_api_key

router = APIRouter(dependencies=[Depends(verify_api_key)])

@router.get("/dashboard/summary", response_model=DashboardStatsResponse, tags=["Dashboard"])
async def get_live_dashboard_summary():
    """
    Computes dynamic statistics directly from real transactions analyzed by the engine during runtime.
    This replaces hardcoded values with actual memory-state processing.
    """
    return LedgerService.get_live_summary()

@router.post("/dashboard/calculate", response_model=DashboardStatsResponse, tags=["Dashboard"])
async def calculate_dashboard_from_records(req: DashboardCalculationRequest):
    """
    Allows Member 2 (Node.js Backend) to submit any batch of historical database records 
    to calculate live statistical distributions for the frontend charts.
    """
    return LedgerService.compute_statistics(req.events)
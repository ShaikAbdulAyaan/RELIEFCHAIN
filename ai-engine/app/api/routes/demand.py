from fastapi import APIRouter, Depends
from app.schemas.demand import DemandPredictionRequest, DemandPredictionResponse
from app.services.demand_service import DemandService
from app.dependencies import verify_api_key

router = APIRouter(dependencies=[Depends(verify_api_key)])

@router.post("/predict-demand", response_model=DemandPredictionResponse, tags=["Relief Operations"])
async def predict_demand(req: DemandPredictionRequest):
    return DemandService.predict(req)
from fastapi import APIRouter, Depends
from app.schemas.inventory import InventoryRiskRequest, InventoryRiskResponse
from app.services.inventory_service import InventoryService
from app.dependencies import verify_api_key

router = APIRouter(dependencies=[Depends(verify_api_key)])

@router.post("/inventory-risk", response_model=InventoryRiskResponse, tags=["Relief Operations"])
async def check_inventory(req: InventoryRiskRequest):
    """Analyzes inventory levels to detect supply shortages."""
    return InventoryService.check_inventory(req)
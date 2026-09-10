from fastapi import APIRouter, Depends
from app.schemas.resource import EmergencyRequest, ResourceMatchResponse
from app.services.resource_service import ResourceService
from app.dependencies import verify_api_key

router = APIRouter(tags=["AI Resource Matching"])

@router.post("/resource-match", response_model=ResourceMatchResponse)
def match_resources(request: EmergencyRequest, api_key: str = Depends(verify_api_key)):
    return ResourceService.match_resources(request)
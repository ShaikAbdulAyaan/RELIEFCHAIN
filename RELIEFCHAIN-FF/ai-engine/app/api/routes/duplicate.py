from fastapi import APIRouter, Depends
from app.schemas.duplicate import DuplicateCheckRequest, DuplicateCheckResponse
from app.services.duplicate_service import DuplicateService
from app.dependencies import verify_api_key

router = APIRouter(tags=["AI Duplicate Check"])

@router.post("/duplicate-check", response_model=DuplicateCheckResponse)
def check_duplicate(request: DuplicateCheckRequest, api_key: str = Depends(verify_api_key)):
    """Cross-references beneficiary data to detect potential duplicates."""
    return DuplicateService.check_duplicate(request)
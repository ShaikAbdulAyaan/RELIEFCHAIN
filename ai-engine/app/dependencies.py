import secrets
from fastapi import Header, HTTPException, status

from app.config import settings


async def verify_api_key(x_api_key: str | None = Header(default=None)) -> str:
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "X-API-KEY header is required"},
        )

    if not secrets.compare_digest(x_api_key, settings.ai_service_api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid API key"},
        )

    return x_api_key

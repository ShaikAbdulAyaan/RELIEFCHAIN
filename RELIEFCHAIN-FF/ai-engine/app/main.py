import logging
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import (
    health, expense, duplicate, distribution, inventory, resource, dashboard, demand
)

logger = logging.getLogger("reliefchain-ai")

app = FastAPI(
    title=settings.app_name,
    description="AI & Risk Analysis Engine for RELIEFCHAIN System",
    version="1.1.0",
    docs_url="/docs"
)

# Parse CORS safely from settings
cors_allowed = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allowed if cors_allowed else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"loc": ".".join(map(str, err["loc"])), "msg": err["msg"]} for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Malformed input or missing required fields",
                "details": errors
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"System Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_AI_ERROR",
                "message": "The AI Engine encountered an unexpected operational error.",
                "details": []
            }
        }
    )

app.include_router(health.router)
app.include_router(expense.router, prefix="/ai")
app.include_router(duplicate.router, prefix="/ai")
app.include_router(distribution.router, prefix="/ai")
app.include_router(inventory.router, prefix="/ai")
app.include_router(resource.router, prefix="/ai")
app.include_router(dashboard.router, prefix="/ai")
app.include_router(demand.router, prefix="/ai")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
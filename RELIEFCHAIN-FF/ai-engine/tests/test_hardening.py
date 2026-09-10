from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)
headers = {"X-API-KEY": settings.ai_service_api_key}


def test_auth_rejection_missing_header():
    res = client.get("/ai/dashboard/summary")
    assert res.status_code == 401


def test_auth_rejection_invalid_key():
    res = client.get("/ai/dashboard/summary", headers={"X-API-KEY": "wrong_key_999"})
    assert res.status_code == 401


def test_auth_success():
    res = client.get("/ai/dashboard/summary", headers=headers)
    assert res.status_code == 200
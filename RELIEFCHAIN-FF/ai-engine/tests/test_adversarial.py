from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)
headers = {"X-API-KEY": settings.ai_service_api_key}

def test_expense_zero_mad_division_safety():
    payload = {
        "expenseId": "EXP-ADV-01",
        "campaignId": "CMP-99",
        "amount": 1000.0,
        "category": "Food",
        "timestamp": "2026-09-04T12:00:00Z",
        "evidenceAvailable": True,
        "historicalExpenses": [500.0, 500.0, 500.0] 
    }
    res = client.post("/ai/expense-risk", json=payload, headers=headers)
    assert res.status_code == 200
    assert "UNUSUAL_AMOUNT" in res.json()["detectedAnomalies"]
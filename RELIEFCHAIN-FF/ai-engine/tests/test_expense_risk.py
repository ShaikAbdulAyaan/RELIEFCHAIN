from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)
headers = {"X-API-KEY": settings.ai_service_api_key}

def test_expense_risk_normal():
    """Tests standard normal expense without anomalies."""
    payload = {
        "expenseId": "EXP-001",
        "campaignId": "CMP-01",
        "amount": 105.0,
        "category": "Food",
        "timestamp": "2026-09-09T10:00:00Z",
        "evidenceAvailable": True,
        # History size >= 12 triggers the actual ML model
        "historicalExpenses": [95.0, 105.0, 100.0, 102.0, 98.0, 101.0, 104.0, 99.0, 100.0, 103.0, 97.0, 106.0]
    }
    res = client.post("/ai/expense-risk", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["riskLevel"] == "LOW"
    assert len(data["detectedAnomalies"]) == 0

def test_expense_risk_ml_anomaly():
    """Tests genuine ML IsolationForest detection (Target: 12,000 against ~100 baseline)."""
    payload = {
        "expenseId": "EXP-002",
        "campaignId": "CMP-01",
        "amount": 12000.0,
        "category": "Logistics",
        "timestamp": "2026-09-09T12:00:00Z",
        "evidenceAvailable": False,  
        "historicalExpenses": [100.0, 110.0, 105.0, 102.0, 99.0, 108.0, 101.0, 100.0, 105.0, 110.0, 104.0, 102.0]
    }
    res = client.post("/ai/expense-risk", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["riskLevel"] == "HIGH"
    assert "UNUSUAL_AMOUNT" in data["detectedAnomalies"]
    assert "MISSING_EVIDENCE" in data["detectedAnomalies"]
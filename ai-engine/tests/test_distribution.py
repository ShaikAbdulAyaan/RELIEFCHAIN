from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)
headers = {"X-API-KEY": settings.ai_service_api_key}

def test_distribution_risk():
    payload = {
        "campId": "CAMP-01",
        "campCapacity": 500,
        "expectedDemandKg": 1000.0,
        "recordedDistributionKg": 1200.0,
        "inventoryAvailableKg": 1500.0,
        "timePeriodHours": 24
    }
    res = client.post("/ai/distribution-risk", json=payload, headers=headers)
    assert res.status_code == 200
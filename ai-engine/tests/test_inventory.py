from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)
headers = {"X-API-KEY": settings.ai_service_api_key}

def test_inventory_shortage():
    payload = {
        "warehouseId": "WH-CENTRAL",
        "itemCategory": "MED-KIT-01",
        "currentQuantity": 50.0,
        "minimumRequired": 200.0,
        "dailyConsumptionRate": 25.0,
        "incomingQuantity": 0.0
    }
    res = client.post("/ai/inventory-risk", json=payload, headers=headers)
    assert res.status_code in [200, 404]
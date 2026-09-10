from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)
headers = {"X-API-KEY": settings.ai_service_api_key}

def test_resource_matching_and_routing():
    payload = {
        "campId": "CAMP-HYD-17",
        "itemCategory": "Drinking Water",
        "requestedQuantity": 2000.0,
        "priority": "HIGH",
        "campLocation": {"latitude": 17.385, "longitude": 78.486},
        "warehouses": [
            {
                "warehouseId": "WH-FAR",
                "location": {"latitude": 18.5, "longitude": 79.2},
                "availableInventory": 10000.0
            }
        ],
        "vehicles": [
            {
                "vehicleId": "TRUCK-01",
                "capacity": 5000.0,
                "available": True
            }
        ]
    }
    res = client.post("/ai/resource-match", json=payload, headers=headers)
    assert res.status_code == 200
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)
headers = {"X-API-KEY": settings.ai_service_api_key}


def test_duplicate_beneficiary_match():
    payload = {
        "target": {
            "beneficiaryId": "BEN-01",
            "location": "Camp Alpha",
            "familySize": 5,
            "demographics": {"ward": "North", "id_last4": "1234"},
            "aidHistory": ["FOOD_01"]
        },
        "comparisonPool": [
            {
                "beneficiaryId": "BEN-02",
                "location": "Camp Alpha",
                "familySize": 5,
                "demographics": {"ward": "North", "id_last4": "1234"},
                "aidHistory": ["FOOD_01"]
            }
        ]
    }
    res = client.post("/ai/duplicate-check", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["possibleDuplicate"] is True
    assert data["similarityScore"] > 80.0


def test_duplicate_beneficiary_distinct():
    payload = {
        "target": {
            "beneficiaryId": "BEN-01",
            "location": "Camp Alpha",
            "familySize": 2,
            "demographics": {},
            "aidHistory": []
        },
        "comparisonPool": [
            {
                "beneficiaryId": "BEN-99",
                "location": "Sector Omega",
                "familySize": 8,
                "demographics": {},
                "aidHistory": []
            }
        ]
    }
    res = client.post("/ai/duplicate-check", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["possibleDuplicate"] is False
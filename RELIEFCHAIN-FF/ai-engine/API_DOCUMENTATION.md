# RELIEFCHAIN - Member 4 AI Engine API Documentation

**Base URL:** `http://127.0.0.1:8001` (or your active Localtunnel/Pinggy link)
**Authentication:** All requests must include the `X-API-KEY` header.

---

## 1. Expense Anomaly Detection
Analyzes a recorded expense against historical baselines, geographic expectations, and operational timing windows to output a structured Risk Score and potential AI Alerts.

**Endpoint:** `POST /ai/expense-risk`
**Headers:**
*   `X-API-KEY`: `[Your Secret Key]`
*   `Content-Type`: `application/json`

### Request Body
```json
{
  "expenseId": "EXP-8291",
  "campaignId": "CMP-100",
  "amount": 4800.0,
  "category": "Transport",
  "supplier": "ABC Logistics",
  "timestamp": "2026-09-04T14:20:00Z",
  "evidenceAvailable": false,
  "historicalExpenses": [1200.0, 1500.0, 1100.0]
}



{
  "expenseId": "EXP-8291",
  "riskScore": 87,
  "riskLevel": "HIGH",
  "reasons": [
    "Missing receipt/evidence.",
    "Amount 4800.0 is significantly above historical baseline."
  ],
  "detectedAnomalies": [
    "MISSING_EVIDENCE",
    "UNUSUAL_AMOUNT"
  ],
  "recommendation": "Reject pending auditor review",
  "generatedAlert": {
    "alertType": "SUSPICIOUS_EXPENSE",
    "severity": "HIGH",
    "entityType": "EXPENSE",
    "entityId": "EXP-8291",
    "message": "Multiple risk factors detected exceeding permissible thresholds.",
    "recommendedAction": "Audit evidence and confirm supplier identity.",
    "createdAt": "2026-09-04T14:20:05Z"
  }
}

{
  "beneficiaryId": "BEN-9901",
  "location": "Camp 17 Sector A",
  "familySize": 4,
  "registrationDate": "2026-09-04T10:00:00Z",
  "demographics": {"ward": "12"},
  "comparisonPool": [
    {
      "beneficiaryId": "BEN-1002",
      "location": "Camp 17 Sector A",
      "familySize": 4,
      "demographics": {"ward": "12"}
    }
  ]
}


{
  "beneficiaryId": "BEN-9901",
  "possibleDuplicate": true,
  "similarityScore": 92.5,
  "matchedBeneficiaryId": "BEN-1002",
  "reasons": [
    "High similarity (92.5%) detected with existing beneficiary BEN-1002 based on location and family demographics."
  ]
}



{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Malformed input or missing required fields",
    "details": [
      {
        "loc": "body.amount",
        "msg": "Field required"
      }
    ]
  }
}
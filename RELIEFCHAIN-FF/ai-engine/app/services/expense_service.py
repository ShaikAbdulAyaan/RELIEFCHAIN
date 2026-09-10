from app.schemas.expense import ExpenseRequest, ExpenseRiskResponse
from app.schemas.alert import AIAlert
from app.algorithms.anomaly import detect_expense_anomaly
from app.algorithms.geospatial import haversine_distance
from app.services.risk_engine import map_score_to_level, calculate_base_risk
from app.services.ledger_service import LedgerService
from app.config import settings
from datetime import timezone

class ExpenseService:
    @staticmethod
    def analyze_expense(req: ExpenseRequest) -> ExpenseRiskResponse:
        reasons, anomalies, factors, weights = [], [], [], []

        if not req.evidence_available:
            factors.append(1.0)
            weights.append(3.0)
            reasons.append("Missing receipt/evidence.")
            anomalies.append("MISSING_EVIDENCE")
        else:
            factors.append(0.0)
            weights.append(3.0)

        # Use the hardened ML engine plus a deterministic baseline guard.
        # The guard catches extreme values even when a statistical model has
        # too little variation to classify them as an outlier.
        is_anomaly, sev = detect_expense_anomaly(req.amount, req.historical_expenses)
        history = [float(x) for x in req.historical_expenses if float(x) >= 0]
        baseline = (sum(history) / len(history)) if history else 0.0
        extreme_ratio = (req.amount / baseline) if baseline > 0 else 0.0
        deterministic_anomaly = baseline > 0 and extreme_ratio >= 3.0
        if deterministic_anomaly:
            is_anomaly = True
            sev = max(float(sev), min(1.0, (extreme_ratio - 1.0) / 4.0))

        if is_anomaly:
            factors.append(sev)
            weights.append(3.5)
            reasons.append(f"Amount {req.amount} flagged by statistical/ML anomaly engine.")
            anomalies.append("UNUSUAL_AMOUNT")
        else:
            factors.append(0.0)
            weights.append(3.5)
            
        if req.location and req.expected_location:
            dist = haversine_distance(
                req.location.latitude, req.location.longitude, 
                req.expected_location.latitude, req.expected_location.longitude
            )
            if dist > settings.location_threshold_km:
                factors.append(1.0)
                weights.append(2.0)
                reasons.append(f"Location mismatch by {dist:.1f} km.")
                anomalies.append("LOCATION_MISMATCH")

        utc_time = req.timestamp.astimezone(timezone.utc)
        if not (settings.timing_start_hour <= utc_time.hour <= settings.timing_end_hour):
            factors.append(0.8)
            weights.append(1.5)
            reasons.append("Transaction outside operational hours.")
            anomalies.append("TIMING_ANOMALY")

        risk_score = round(calculate_base_risk(factors, weights)) if factors else 0
        # Missing evidence combined with a statistical/ML amount anomaly is
        # materially higher risk than either signal alone.
        if "MISSING_EVIDENCE" in anomalies and "UNUSUAL_AMOUNT" in anomalies:
            risk_score = max(risk_score, 75)
        risk_level = map_score_to_level(risk_score)
        
        alert = None
        if risk_level == "HIGH":
            alert = AIAlert(
                alert_type="SUSPICIOUS_EXPENSE", severity="HIGH", entity_type="EXPENSE", 
                entity_id=req.expense_id, message="Multiple risk factors detected.", 
                recommended_action="Audit required."
            )
            LedgerService.record_alert(alert)

        LedgerService.record_event({"event_id": req.expense_id, "event_type": "EXPENSE", "risk_level": risk_level, "risk_score": risk_score, "anomalies": anomalies})

        return ExpenseRiskResponse(
            expense_id=req.expense_id, risk_score=risk_score, risk_level=risk_level,
            reasons=reasons or ["Appears normal."], detected_anomalies=anomalies, 
            recommendation="Reject" if risk_level == "HIGH" else "Approve", 
            generated_alert=alert
        )
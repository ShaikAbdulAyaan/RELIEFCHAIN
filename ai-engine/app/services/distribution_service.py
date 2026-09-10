from datetime import datetime, timezone
from uuid import uuid4
from app.config import settings
from app.schemas.alert import AIAlert
from app.schemas.distribution import (
    DistributionRiskRequest,
    DistributionRiskResponse,
    DistributionCheckRequest,
    DistributionCheckResponse,
)
from app.services.ledger_service import ledger
from app.services.risk_engine import clamp_score, risk_level


class DistributionService:
    @staticmethod
    def analyze(req: DistributionRiskRequest) -> DistributionRiskResponse:
        expected = max(0.0, req.expected_consumption_per_capita * req.camp_capacity)
        recorded = max(0.0, req.recorded_distribution_quantity)
        inventory = max(0.0, req.available_inventory)
        reasons: list[str] = []
        components: list[float] = []
        anomaly = False

        if expected == 0 and recorded > 0:
            anomaly = True
            components.append(1.0)
            reasons.append("Recorded distribution exists while expected demand is zero.")
        elif expected > 0 and recorded > expected:
            ratio = (recorded - expected) / expected
            anomaly = True
            components.append(min(1.0, max(0.5, ratio)))
            reasons.append(f"Recorded distribution exceeds expected demand by {recorded - expected:.2f} units ({ratio * 100:.1f}%).")
        else:
            components.append(0.0)

        if recorded > inventory:
            anomaly = True
            components.append(1.0)
            reasons.append(f"Recorded distribution exceeds available inventory by {recorded - inventory:.2f} units.")
        else:
            components.append(0.0)

        if req.time_period_hours > 24:
            reasons.append("Time period exceeds one day; verify that demand and inventory use the same period.")

        score = round(clamp_score((sum(components) / max(len(components), 1)) * 100))
        level = risk_level(score)
        alert = None
        if level == "HIGH":
            alert = AIAlert(
                alert_type="DISTRIBUTION_MISMATCH",
                severity="HIGH",
                entity_type="DISTRIBUTION",
                entity_id=req.camp_id,
                message="Recorded distribution materially conflicts with supplied demand or inventory.",
                recommended_action="Pause approval and reconcile inventory/distribution records.",
            )
            ledger.record_alert(alert)

        ledger.record_event({
            "event_id": req.camp_id,
            "event_type": "DISTRIBUTION",
            "risk_level": level,
            "risk_score": score,
            "anomalies": ["QUANTITY_ANOMALY"] if anomaly else [],
        })

        return DistributionRiskResponse(
            risk_score=score,
            risk_level=level,
            expected_quantity=expected,
            recorded_quantity=recorded,
            difference=round(recorded - expected, 4),
            inventory_available=inventory,
            reasons=reasons or ["Distribution is consistent with supplied demand and inventory."],
            quantity_anomaly_detected=anomaly,
            generated_alert=alert,
        )

    @staticmethod
    def analyze_distribution(req: DistributionRiskRequest) -> DistributionRiskResponse:
        return DistributionService.analyze(req)

    @staticmethod
    def check_beneficiary_distribution(req: DistributionCheckRequest) -> DistributionCheckResponse:
        reasons: list[str] = []
        duplicate = False
        quantity_anomaly = False

        if req.last_aid_received_time:
            last = req.last_aid_received_time
            if last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            now = req.current_request_time
            if now.tzinfo is None:
                now = now.replace(tzinfo=timezone.utc)
            elapsed = (now - last).total_seconds() / 3600
            if elapsed < req.cooldown_hours and (not req.last_aid_category or req.last_aid_category.lower() == req.item_category.lower()):
                duplicate = True
                reasons.append(f"Beneficiary received the same aid category {elapsed:.1f} hours ago, within the {req.cooldown_hours:.1f}-hour cooldown.")

        inventory_ok = req.requested_quantity <= req.available_camp_inventory
        if not inventory_ok:
            reasons.append("Requested quantity exceeds available camp inventory.")

        allowance = max(0.0, req.family_size * req.per_person_allowance)
        if req.requested_quantity > allowance:
            quantity_anomaly = True
            reasons.append(f"Requested quantity exceeds the family allowance of {allowance:.2f} units.")

        risk = 0
        if duplicate:
            risk += 70
        if not inventory_ok:
            risk += 25
        if quantity_anomaly:
            risk += 20
        risk = min(100, risk)
        level = risk_level(risk)
        eligible = not duplicate and inventory_ok and not quantity_anomaly

        if eligible:
            action = "Approve distribution."
        elif duplicate:
            action = "Reject duplicate request and review beneficiary history."
        elif not inventory_ok:
            action = "Reject or wait for inventory replenishment."
        else:
            action = "Review requested quantity before approval."

        ledger.record_event({
            "event_id": req.beneficiary_id,
            "event_type": "BENEFICIARY",
            "risk_level": level,
            "risk_score": risk,
            "anomalies": (["DUPLICATE_BENEFICIARY"] if duplicate else []) + (["QUANTITY_ANOMALY"] if quantity_anomaly else []),
        })

        return DistributionCheckResponse(
            beneficiary_id=req.beneficiary_id,
            eligible=eligible,
            possible_duplicate=duplicate,
            inventory_available=inventory_ok,
            quantity_anomaly=quantity_anomaly,
            risk_score=risk,
            risk_level=level,
            reasons=reasons or ["Beneficiary is eligible under the supplied rules."],
            recommended_action=action,
        )
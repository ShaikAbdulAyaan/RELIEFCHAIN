import logging
from collections import Counter
from threading import Lock
from typing import Any, Dict, Iterable

logger = logging.getLogger("reliefchain-ledger")


class LedgerService:
    """Small in-process audit ledger used by the AI service.

    The source of truth remains PostgreSQL/blockchain. This ledger only keeps
    AI analyses made during the current AI-process lifetime so the dashboard
    endpoint can provide live engine statistics without another database.
    """

    _events: list[Dict[str, Any]] = []
    _alerts: list[Any] = []
    _lock = Lock()

    @classmethod
    def record_event(cls, event_data: Any) -> None:
        if hasattr(event_data, "model_dump"):
            event_data = event_data.model_dump()
        elif not isinstance(event_data, dict):
            event_data = {"event_id": str(event_data)}

        with cls._lock:
            cls._events.append(dict(event_data))
            if len(cls._events) > 10000:
                cls._events = cls._events[-10000:]
        logger.info("Ledger Event Recorded: %s", event_data)

    @classmethod
    def record_alert(cls, alert: Any) -> None:
        with cls._lock:
            cls._alerts.append(alert)
            if len(cls._alerts) > 10000:
                cls._alerts = cls._alerts[-10000:]
        logger.warning("Ledger Alert Triggered: %s", alert)

    @classmethod
    def _snapshot(cls) -> tuple[list[Dict[str, Any]], list[Any]]:
        with cls._lock:
            return list(cls._events), list(cls._alerts)

    @classmethod
    def compute_statistics(cls, events: Iterable[Any]) -> Dict[str, Any]:
        normalized: list[Dict[str, Any]] = []
        for event in events:
            if hasattr(event, "model_dump"):
                event = event.model_dump()
            if isinstance(event, dict):
                normalized.append(event)

        risk = Counter()
        anomalies = Counter()
        event_count = 0
        duplicates = 0

        for event in normalized:
            event_count += 1
            level = str(event.get("risk_level") or event.get("riskLevel") or "LOW").upper()
            if level in {"LOW", "MEDIUM", "HIGH"}:
                risk[level] += 1

            raw_anomalies = event.get("anomalies") or event.get("anomaly_types") or event.get("anomalyTypes") or []
            if isinstance(raw_anomalies, str):
                raw_anomalies = [raw_anomalies]
            for anomaly in raw_anomalies:
                key = str(anomaly).upper()
                anomalies[key] += 1
                if "DUPLICATE" in key:
                    duplicates += 1

        total = max(event_count, 1)
        anomaly_total = sum(anomalies.values()) or 1
        missing = anomalies.get("MISSING_EVIDENCE", 0)
        quantity = anomalies.get("QUANTITY_ANOMALY", 0) + anomalies.get("DISTRIBUTION_MISMATCH", 0)
        location = anomalies.get("LOCATION_MISMATCH", 0)
        timing = anomalies.get("TIMING_ANOMALY", 0)
        inventory = anomalies.get("INVENTORY_SHORTAGE", 0)

        return {
            "total_analyzed": event_count,
            "low_risk": risk.get("LOW", 0),
            "medium_risk": risk.get("MEDIUM", 0),
            "high_risk": risk.get("HIGH", 0),
            "possible_duplicates": duplicates,
            "missing_evidence": missing,
            "quantity_anomalies": quantity,
            "location_anomalies": location,
            "timing_anomalies": timing,
            "inventory_shortages": inventory,
            "risk_distribution": {
                "LOW": risk.get("LOW", 0),
                "MEDIUM": risk.get("MEDIUM", 0),
                "HIGH": risk.get("HIGH", 0),
            },
            "anomaly_breakdown_percentage": {
                key: round((value / anomaly_total) * 100, 2)
                for key, value in anomalies.items()
            },
        }

    @classmethod
    def get_live_summary(cls) -> Dict[str, Any]:
        events, _alerts = cls._snapshot()
        return cls.compute_statistics(events)


# Backwards-compatible instance used by older service modules.
ledger = LedgerService()
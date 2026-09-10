import numpy as np
from sklearn.ensemble import IsolationForest
from app.config import settings
from app.utils.normalization import clamp

def calculate_mad_deviation(value: float, history: list[float]) -> float:
    """Robust statistical fallback (MAD)."""
    if not history:
        return 0.0
        
    arr = np.array(history, dtype=float)
    median = np.median(arr)
    mad = np.median(np.abs(arr - median))
    
    if mad == 0:
        return 10.0 if value != median else 0.0
            
    return float(abs(value - median) / mad)

def detect_expense_anomaly(value: float, history: list[float]) -> tuple[bool, float]:
    """Dual-engine anomaly detection (IsolationForest ML + MAD Fallback)."""
    if not history:
        return False, 0.0

    # Guard the ML path with the robust statistic as well. IsolationForest can
    # occasionally treat an extreme value outside a very small training range
    # as in-distribution; MAD gives us a deterministic safety net for those
    # cases and for the zero-MAD case.
    deviation = calculate_mad_deviation(value, history)
    if deviation > 3.0:
        return True, clamp(deviation / 6.0, 0.0, 1.0)
    
    if len(history) >= settings.model_min_history:
        # Genuine ML: Train ONLY on history, predict on target
        history_array = np.array(history).reshape(-1, 1)
        target_array = np.array([[value]])
        
        model = IsolationForest(contamination=0.1, random_state=42)
        model.fit(history_array)
        
        pred = model.predict(target_array)[0]
        decision_score = model.decision_function(target_array)[0]
        
        is_anomaly = (pred == -1)
        severity = float(abs(decision_score)) if is_anomaly else 0.0
        return bool(is_anomaly), clamp(severity, 0.0, 1.0)
    else:
        deviation = calculate_mad_deviation(value, history)
        return deviation > 3.0, clamp(deviation / 6.0, 0.0, 1.0)
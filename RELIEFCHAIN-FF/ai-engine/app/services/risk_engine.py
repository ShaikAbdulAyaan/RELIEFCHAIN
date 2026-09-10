from app.utils.normalization import clamp

# 1. Supports the exact name distribution_service.py is looking for
def clamp_score(score: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return clamp(score, min_val, max_val)

# 2. Supports the exact name expense_service.py is looking for
def map_score_to_level(score: float) -> str:
    if score >= 75.0:
        return "HIGH"
    elif score >= 40.0:
        return "MEDIUM"
    return "LOW"

# 3. Supports the alternative name distribution_service.py is looking for
def risk_level(score: float) -> str:
    return map_score_to_level(score)

# 4. Core risk math used across the app
def calculate_base_risk(factors: list[float], weights: list[float]) -> float:
    if not factors or not weights or sum(weights) == 0:
        return 0.0
    weighted_sum = sum(f * w for f, w in zip(factors, weights))
    return clamp_score((weighted_sum / sum(weights)) * 100.0)
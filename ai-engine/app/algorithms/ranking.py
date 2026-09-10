def calculate_resource_score(distance_km: float, inventory_ratio: float, priority: str) -> float:
    """Ranks warehouses based on distance, stock adequacy, and request priority."""
    # Normalize distance (closer is better, max reasonable distance 500km)
    dist_score = max(0, 100 - (distance_km / 500 * 100)) if distance_km >= 0 else 50
    
    # Inventory score (1.0 ratio = 100)
    inv_score = min(100, inventory_ratio * 100)
    
    # Priority multipliers
    weights = {"HIGH": (0.3, 0.7), "MEDIUM": (0.5, 0.5), "LOW": (0.7, 0.3)}
    w_dist, w_inv = weights.get(priority.upper(), (0.5, 0.5))
    
    return round((dist_score * w_dist) + (inv_score * w_inv), 2)
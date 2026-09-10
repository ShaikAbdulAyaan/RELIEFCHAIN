import math

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates geographic distance. Includes adversarial input sanitization.
    """
    # Sanitize inputs to valid earth coordinates to prevent math domain errors
    if not (-90.0 <= lat1 <= 90.0 and -180.0 <= lon1 <= 180.0 and 
            -90.0 <= lat2 <= 90.0 and -180.0 <= lon2 <= 180.0):
        return -1.0 # Denotes invalid coordinate calculation

    R = 6371.0  # Earth radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0)**2
    
    # Protect against floating point inaccuracy exceeding 1.0
    a = min(1.0, max(0.0, a))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c
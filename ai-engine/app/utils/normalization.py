import re

def clamp(value: float, min_value: float, max_value: float) -> float:
    """Strictly bounds a value between a minimum and maximum limit."""
    return max(min_value, min(value, max_value))

def to_camel(snake_str: str) -> str:
    """Converts a snake_case string to camelCase for API JSON responses."""
    if not snake_str:
        return ""
    components = snake_str.split("_")
    if not components or not components[0]:
        return snake_str
    return components[0] + "".join(x.title() for x in components[1:])

def to_snake(camel_str: str) -> str:
    """Converts a camelCase string to snake_case."""
    return re.sub(r'(?<!^)(?=[A-Z])', '_', camel_str).lower()

def normalize_string(text: str) -> str:
    """Standardizes strings: lowercases, strips whitespace, and removes punctuation."""
    if not text:
        return ""
    text = text.strip().lower()
    text = re.sub(r'[^\w\s]', '', text)
    return re.sub(r'\s+', ' ', text)

def normalize_text(text: str) -> str:
    """Alias for normalize_string."""
    return normalize_string(text)

def normalize_phone(phone: str) -> str:
    """Strips non-digit characters from phone numbers."""
    if not phone:
        return ""
    return re.sub(r'\D', '', phone)

def min_max_scale(value: float, min_val: float, max_val: float) -> float:
    """Scales a numerical value into the [0.0, 1.0] range safely."""
    if max_val <= min_val:
        return 0.0
    scaled = (value - min_val) / (max_val - min_val)
    return clamp(scaled, 0.0, 1.0)
from app.utils.normalization import normalize_string, clamp

def numeric_similarity(n1: float, n2: float, max_diff: float = 10.0) -> float:
    """Calculates similarity between two numbers. 1.0 if identical, 0.0 if diff > max_diff."""
    if n1 is None or n2 is None:
        return 0.0
    if n1 == n2:
        return 1.0
    diff = abs(n1 - n2)
    return 0.0 if diff >= max_diff else clamp(1.0 - (diff / max_diff), 0.0, 1.0)

def levenshtein_distance(s1: str, s2: str) -> int:
    s1, s2 = normalize_string(s1), normalize_string(s2)
    if len(s1) < len(s2): 
        return levenshtein_distance(s2, s1)
    if len(s2) == 0: 
        return len(s1)
    prev = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            curr.append(min(prev[j + 1] + 1, curr[j] + 1, prev[j] + (c1 != c2)))
        prev = curr
    return prev[-1]

def string_similarity(s1: str, s2: str) -> float:
    n1, n2 = normalize_string(s1), normalize_string(s2)
    if not n1 and not n2: return 1.0
    if not n1 or not n2: return 0.0
    return clamp(1.0 - (levenshtein_distance(n1, n2) / max(len(n1), len(n2))), 0.0, 1.0)

def token_similarity(s1: str, s2: str) -> float:
    t1, t2 = set(normalize_string(s1).split()), set(normalize_string(s2).split())
    if not t1 and not t2: return 1.0
    if not t1 or not t2: return 0.0
    return float(len(t1 & t2) / len(t1 | t2))

def jaccard_similarity(list1: list, list2: list) -> float:
    s1, s2 = set(list1 or []), set(list2 or [])
    if not s1 and not s2: return 1.0
    if not s1 or not s2: return 0.0
    return float(len(s1 & s2) / len(s1 | s2))

def calculate_similarity(s1: str, s2: str) -> float:
    return round(0.6 * string_similarity(s1, s2) + 0.4 * token_similarity(s1, s2), 4)

def fuzzy_match_ratio(s1: str, s2: str) -> float:
    return calculate_similarity(s1, s2)
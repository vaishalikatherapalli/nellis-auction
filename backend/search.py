from rapidfuzz import fuzz
from typing import List

SYNONYMS = {
    "tv": ["television", "screen", "display"],
    "laptop": ["computer", "notebook", "macbook"],
    "phone": ["smartphone", "iphone", "mobile", "android"],
    "fridge": ["refrigerator", "freezer"],
    "vacuum": ["roomba", "dyson", "cleaner"],
    "bike": ["bicycle", "cycling"],
    "headphones": ["earphones", "headset", "earbuds", "audio"],
    "grill": ["bbq", "barbecue", "smoker"],
    "drone": ["dji", "quadcopter", "uav"],
    "drill": ["dewalt", "tool", "power tool"],
    "mixer": ["kitchenaid", "blender", "stand mixer"],
    "chair": ["seating", "desk chair", "office"],
}


def expand_query(query: str) -> List[str]:
    q = query.lower().strip()
    terms = [q]
    for key, synonyms in SYNONYMS.items():
        if key in q:
            terms.extend(synonyms)
    return list(set(terms))


def score_item(item: dict, terms: List[str]) -> float:
    best = 0.0
    title = item["title"].lower()
    desc = item["description"].lower()
    cat = item["category"].lower()
    lot = item["lot"].lower()

    for term in terms:
        scores = [
            fuzz.partial_ratio(term, title) * 1.0,
            fuzz.token_sort_ratio(term, title) * 0.95,
            fuzz.ratio(term, lot) * 1.0,
            fuzz.partial_ratio(term, desc) * 0.65,
            fuzz.ratio(term, cat) * 0.5,
        ]
        best = max(best, max(scores))
    return round(best, 1)


def fuzzy_search(items: List[dict], query: str, threshold: int = 38) -> dict:
    if not query.strip():
        return {"items": items, "query": query, "total": len(items), "expanded_terms": []}

    terms = expand_query(query)
    results = []
    for item in items:
        score = score_item(item, terms)
        if score >= threshold:
            results.append({**item, "_score": score})

    results.sort(key=lambda x: x["_score"], reverse=True)
    return {
        "items": results,
        "query": query,
        "total": len(results),
        "expanded_terms": terms,
    }

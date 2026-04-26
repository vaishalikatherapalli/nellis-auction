from typing import List, Tuple


def optimize_route(items: List[dict]) -> Tuple[List[dict], dict]:
    """
    Sort items by warehouse row (A→Z) then shelf position (1→N).
    Returns sorted items + efficiency stats.
    """
    sorted_items = sorted(items, key=lambda x: (x.get("row", "Z"), x.get("position", 999)))

    for i, item in enumerate(sorted_items):
        item["pickup_sequence"] = i + 1
        item["eta_seconds"] = i * 45

    rows_visited = []
    seen = set()
    for item in sorted_items:
        row = item.get("row", "?")
        if row not in seen:
            rows_visited.append(f"Row {row}")
            seen.add(row)

    efficiency = {
        "total_items": len(sorted_items),
        "rows_visited": rows_visited,
        "estimated_minutes": round(len(sorted_items) * 0.75, 1),
        "walking_order": [f"{i['lot']} → {i['location']}" for i in sorted_items],
    }

    return sorted_items, efficiency

import os
import random
from datetime import datetime
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from data import ITEMS, BID_HISTORY, RETURNS, PICKUP_SLOTS, LOCATIONS
from search import fuzzy_search
from optimizer import optimize_route

app = FastAPI(title="BidFlow Auction Platform API")

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state
items_db = [dict(item) for item in ITEMS]

PROFILE = {
    "name": "Alex Johnson",
    "customer_id": "CUST-7291",
    "email": "alex@bidflow.demo",
    "plates": ["TX-ABC1234", "TX-XYZ5678"],
}

CHECKINS = []


# ── helpers ──────────────────────────────────────────────

def find_item(item_id: int):
    item = next((i for i in items_db if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


def normalize_plate(plate: str) -> str:
    return plate.upper().replace(" ", "").replace("-", "")


def assign_bay(items: list) -> str:
    large = {"Outdoor", "Sports", "Furniture"}
    has_large = any(i["category"] in large for i in items)
    return f"Bay {random.choice([4, 5])}" if has_large else f"Bay {random.choice([1, 2, 3])}"


def build_checkin_response(method: str, identifier: str, pickup_items: list) -> dict:
    bay = assign_bay(pickup_items) if pickup_items else None
    optimized, efficiency = optimize_route([dict(i) for i in pickup_items])
    entry = {
        "id": len(CHECKINS) + 1,
        "method": method,
        "identifier": identifier,
        "checked_in_at": datetime.now().isoformat(),
        "bay": bay,
        "items_count": len(pickup_items),
    }
    CHECKINS.append(entry)
    return {
        "success": True,
        "customer_name": PROFILE["name"],
        "customer_id": PROFILE["customer_id"],
        "bay": bay,
        "items": optimized,
        "efficiency": efficiency,
        "checked_in_at": entry["checked_in_at"],
    }


# ── Pydantic models ───────────────────────────────────────

class BatchScanRequest(BaseModel):
    lot_numbers: List[str]

class PickupUpdateRequest(BaseModel):
    pickup_status: str

class PlateScanRequest(BaseModel):
    plate: str

class QRCheckinRequest(BaseModel):
    customer_id: str

class PlatesUpdateRequest(BaseModel):
    plates: List[str]


# ── Existing endpoints ────────────────────────────────────

@app.get("/api/stats")
def get_stats():
    won = [i for i in items_db if i["status"] in ("won", "picked_up")]
    active = [i for i in items_db if i["status"] == "active"]
    pending = [i for i in items_db if i["pickup_status"] in ("pending", "scheduled")]
    return {
        "total_won": len(won),
        "active_bids": len(active),
        "pending_pickup": len(pending),
        "total_saved": round(sum(i["retail_price"] - i["my_bid"] for i in won), 2),
        "total_spent": round(sum(i["my_bid"] for i in won), 2),
        "total_items": len(items_db),
    }


@app.get("/api/items")
def list_items(status: Optional[str] = Query(None), category: Optional[str] = Query(None)):
    result = items_db
    if status:
        result = [i for i in result if i["status"] == status]
    if category:
        result = [i for i in result if i["category"].lower() == category.lower()]
    return result


@app.get("/api/items/{item_id}")
def get_item(item_id: int):
    return find_item(item_id)


@app.patch("/api/items/{item_id}/pickup")
def update_pickup(item_id: int, body: PickupUpdateRequest):
    item = find_item(item_id)
    valid = ("pending", "scheduled", "completed")
    if body.pickup_status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    item["pickup_status"] = body.pickup_status
    if body.pickup_status == "completed":
        item["status"] = "picked_up"
    return item


@app.get("/api/search")
def search_items(q: str = Query(..., min_length=1)):
    return fuzzy_search(items_db, q)


@app.post("/api/pickup/batch-scan")
def batch_scan(body: BatchScanRequest):
    lots = [l.strip().upper() for l in body.lot_numbers]
    found = [i for i in items_db if i["lot"].upper() in lots and i["status"] == "won"]
    not_found = [l for l in lots if l not in {i["lot"].upper() for i in found}]
    optimized, efficiency = optimize_route([dict(i) for i in found])
    return {"found": optimized, "not_found": not_found, "efficiency": efficiency}


@app.get("/api/pickup/pending")
def pending_pickup():
    items = [i for i in items_db if i["pickup_status"] in ("pending", "scheduled")]
    optimized, efficiency = optimize_route([dict(i) for i in items])
    return {"items": optimized, "efficiency": efficiency}


@app.get("/api/categories")
def list_categories():
    return sorted(set(i["category"] for i in items_db))


# ── Profile endpoints ─────────────────────────────────────

@app.get("/api/profile")
def get_profile():
    return PROFILE


@app.put("/api/profile/plates")
def update_plates(body: PlatesUpdateRequest):
    if len(body.plates) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 plates allowed.")
    PROFILE["plates"] = [p.upper().strip() for p in body.plates if p.strip()]
    return PROFILE


# ── Check-in endpoints ────────────────────────────────────

@app.post("/api/checkin/plate")
def checkin_by_plate(body: PlateScanRequest):
    entered = normalize_plate(body.plate)
    registered = [normalize_plate(p) for p in PROFILE["plates"]]

    if entered not in registered:
        return {
            "success": False,
            "reason": "plate_not_found",
            "message": "Plate not recognized. Please use QR code fallback.",
        }

    pickup_items = [i for i in items_db if i["status"] == "won" and i["pickup_status"] in ("pending", "scheduled")]
    return build_checkin_response("plate", body.plate.upper(), pickup_items)


@app.post("/api/checkin/qr")
def checkin_by_qr(body: QRCheckinRequest):
    if body.customer_id.strip().upper() != PROFILE["customer_id"].upper():
        raise HTTPException(status_code=404, detail="Customer ID not found.")
    pickup_items = [i for i in items_db if i["status"] == "won" and i["pickup_status"] in ("pending", "scheduled")]
    return build_checkin_response("qr", body.customer_id, pickup_items)


@app.get("/api/checkin/history")
def checkin_history():
    return list(reversed(CHECKINS))


# ── BidFlow new endpoints ─────────────────────────────────

class PlaceBidRequest(BaseModel):
    amount: float
    bidder: Optional[str] = "anonymous"

class ReturnRequest(BaseModel):
    item_id: int
    reason: str
    notes: Optional[str] = ""
    lot: Optional[str] = ""
    title: Optional[str] = ""

class SchedulePickupRequest(BaseModel):
    item_ids: List[int]
    date: str
    time_slot: str
    location_id: str


@app.get("/api/auctions")
def list_auctions(status: Optional[str] = Query(None), category: Optional[str] = Query(None)):
    result = items_db
    if status:
        result = [i for i in result if i["status"] == status]
    if category:
        result = [i for i in result if i["category"].lower() == category.lower()]
    return result


@app.get("/api/auctions/{item_id}")
def get_auction(item_id: int):
    item = find_item(item_id)
    history = BID_HISTORY.get(item_id, [])
    return {**item, "bid_history": history}


@app.post("/api/auctions/{item_id}/bid")
def place_bid(item_id: int, body: PlaceBidRequest):
    item = find_item(item_id)
    if item["status"] != "active":
        raise HTTPException(status_code=400, detail="Auction is not active.")
    if body.amount <= item["current_bid"]:
        raise HTTPException(status_code=400, detail=f"Bid must be higher than current bid of ${item['current_bid']}.")
    item["current_bid"] = body.amount
    item["bid_count"] = item.get("bid_count", 0) + 1
    if item_id not in BID_HISTORY:
        BID_HISTORY[item_id] = []
    BID_HISTORY[item_id].insert(0, {"bidder": body.bidder or "buyer_demo", "amount": body.amount, "time": "just now"})
    return {**item, "bid_history": BID_HISTORY[item_id], "message": "Bid placed successfully!"}


@app.get("/api/returns")
def list_returns():
    return RETURNS


@app.post("/api/returns")
def submit_return(body: ReturnRequest):
    item = find_item(body.item_id)
    entry = {
        "id": len(RETURNS) + 1,
        "item_id": body.item_id,
        "lot": item["lot"],
        "title": item["title"],
        "reason": body.reason,
        "notes": body.notes,
        "status": "pending",
        "submitted_at": datetime.now().isoformat(),
        "refund_amount": item["my_bid"],
    }
    RETURNS.append(entry)
    return entry


@app.get("/api/pickup/slots")
def get_pickup_slots():
    return PICKUP_SLOTS


@app.post("/api/pickup/schedule")
def schedule_pickup(body: SchedulePickupRequest):
    if body.date not in PICKUP_SLOTS:
        raise HTTPException(status_code=400, detail="Date not available.")
    if body.time_slot not in PICKUP_SLOTS[body.date]:
        raise HTTPException(status_code=400, detail="Time slot not available.")
    items = [find_item(i) for i in body.item_ids]
    for item in items:
        item["pickup_status"] = "scheduled"
        item["pickup_date"] = body.date
    location = next((l for l in LOCATIONS if l["id"] == body.location_id), LOCATIONS[0])
    return {
        "confirmation_id": f"PU-{random.randint(10000,99999)}",
        "date": body.date,
        "time_slot": body.time_slot,
        "location": location,
        "items": items,
        "message": "Pickup scheduled successfully!",
    }


@app.get("/api/locations")
def get_locations():
    return LOCATIONS

# Nellis Auction Dashboard

A full-stack auction management dashboard with AI-powered fuzzy search, a pickup route optimizer, bid tracking, and batch scan simulation.

**Backend:** FastAPI · Python · rapidfuzz  
**Frontend:** React · Vite · Tailwind CSS  
**Deploy:** Render (backend) · Vercel (frontend)

---

## Features

- **Bid Tracker** — sortable table with status badges (Active, Won, Outbid, Picked Up)
- **AI Fuzzy Search** — multi-field weighted search with synonym expansion ("TV" → finds televisions, "vacuum" → finds Roomba)
- **Pickup Optimizer** — batch scan lot numbers, get an optimized warehouse walking route
- **Click-to-complete** — mark items as picked up directly from the checklist
- **Live stats** — total won, amount saved, active bids, pending pickups

---

## Run Locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at → **http://127.0.0.1:8000**  
Docs at → **http://127.0.0.1:8000/docs**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at → **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Dashboard stats (won, saved, pending) |
| `GET` | `/api/items` | All items (filter by `?status=` or `?category=`) |
| `GET` | `/api/items/{id}` | Single item |
| `GET` | `/api/search?q=` | Fuzzy search with synonym expansion |
| `POST` | `/api/pickup/batch-scan` | Scan lot numbers, get optimized route |
| `GET` | `/api/pickup/pending` | All pending pickups in optimized order |
| `PATCH` | `/api/items/{id}/pickup` | Update pickup status |
| `GET` | `/api/categories` | List all categories |

### Batch Scan Example

```bash
curl -X POST http://127.0.0.1:8000/api/pickup/batch-scan \
  -H "Content-Type: application/json" \
  -d '{"lot_numbers": ["LOT-4190", "LOT-4312", "LOT-4815"]}'
```

---

## Deploy to Render (Backend)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `ALLOWED_ORIGINS=https://your-app.vercel.app`
7. Deploy — Render gives you a URL like `https://nellis-dashboard-api.onrender.com`

---

## Deploy to Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy — Vercel auto-detects Vite

---

## Project Structure

```
nellis-dashboard/
├── backend/
│   ├── main.py          # FastAPI routes + CORS
│   ├── data.py          # Mock auction items (18 items)
│   ├── search.py        # Fuzzy search engine (rapidfuzz + synonyms)
│   ├── optimizer.py     # Pickup route optimizer (sort by row/position)
│   ├── requirements.txt
│   ├── Procfile         # Render start command
│   └── render.yaml      # Render config
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main layout + tab navigation
    │   ├── api.js               # All Axios API calls
    │   └── components/
    │       ├── ItemCard.jsx     # Auction item card
    │       ├── BidTracker.jsx   # Filterable bid table
    │       ├── PickupPanel.jsx  # Batch scan + checklist
    │       ├── SearchPanel.jsx  # Fuzzy search UI
    │       └── StatusBadge.jsx  # Colored status pills
    ├── vercel.json       # SPA routing for Vercel
    └── tailwind.config.js
```

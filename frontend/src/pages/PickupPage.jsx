import { useState, useEffect } from "react";
import { getItems, getPickupSlots, schedulePickup, getLocations } from "../api";

export default function PickupPage() {
  const [view,         setView]         = useState("schedule");
  const [wonItems,     setWonItems]     = useState([]);
  const [slots,        setSlots]        = useState({});
  const [locations,    setLocations]    = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedLoc,  setSelectedLoc]  = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    getItems({ status: "won" }).then(setWonItems).catch(() => {});
    getPickupSlots().then(setSlots).catch(() => {});
    getLocations().then(locs => { setLocations(locs); if (locs.length) setSelectedLoc(locs[0].id); }).catch(() => {});
  }, []);

  const toggleItem = (id) => setSelectedItems(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  const handleSchedule = async () => {
    if (!selectedItems.length || !selectedDate || !selectedTime || !selectedLoc) return;
    setSubmitting(true);
    try {
      const result = await schedulePickup({
        item_ids: selectedItems,
        date: selectedDate,
        time_slot: selectedTime,
        location_id: selectedLoc,
      });
      setConfirmation(result);
      setView("confirmation");
    } catch { /* demo */ }
    finally { setSubmitting(false); }
  };

  const dates = Object.keys(slots);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-900">Pickup Scheduler</h1>
        <p className="text-brand-500 text-sm mt-1">Schedule a convenient pickup time for your won items.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex bg-white border border-brand-200 rounded-card shadow-card overflow-hidden mb-8 w-fit">
        {[["schedule", "📅 Schedule Pickup"], ["checkin", "🚗 Check-In"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
              view === id ? "border-primary text-primary bg-blue-50" : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-100"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Schedule view */}
      {view === "schedule" && !confirmation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Step 1: Select items */}
          <div className="bg-white rounded-card border border-brand-200 shadow-card p-5">
            <h3 className="font-bold text-brand-900 mb-1 text-sm">1. Select Items</h3>
            <p className="text-xs text-brand-500 mb-4">Choose which won items to pick up</p>
            {wonItems.length === 0 ? (
              <p className="text-sm text-brand-400 py-4 text-center">No items pending pickup.</p>
            ) : wonItems.map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-btn border mb-2 transition-all ${
                  selectedItems.includes(item.id) ? "border-primary bg-blue-50" : "border-brand-200 hover:border-brand-300"
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  selectedItems.includes(item.id) ? "border-primary bg-primary" : "border-brand-300"
                }`}>
                  {selectedItems.includes(item.id) && <span className="text-white text-xs leading-none">✓</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-brand-900 truncate">{item.title}</p>
                  <p className="text-xs text-brand-400 font-mono">{item.lot}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Step 2: Date & time */}
          <div className="bg-white rounded-card border border-brand-200 shadow-card p-5">
            <h3 className="font-bold text-brand-900 mb-1 text-sm">2. Choose Date & Time</h3>
            <p className="text-xs text-brand-500 mb-4">Select an available slot</p>

            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Date</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {dates.map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDate(d); setSelectedTime(""); }}
                  className={`py-2 text-xs font-semibold rounded-btn border transition-all ${
                    selectedDate === d ? "border-primary bg-blue-50 text-primary" : "border-brand-200 text-brand-700 hover:border-brand-400"
                  }`}
                >
                  {new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </button>
              ))}
            </div>

            {selectedDate && (
              <>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Time Slot</p>
                <div className="grid grid-cols-2 gap-2">
                  {slots[selectedDate]?.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 text-xs font-semibold rounded-btn border transition-all ${
                        selectedTime === t ? "border-primary bg-blue-50 text-primary" : "border-brand-200 text-brand-700 hover:border-brand-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Step 3: Location + confirm */}
          <div className="bg-white rounded-card border border-brand-200 shadow-card p-5">
            <h3 className="font-bold text-brand-900 mb-1 text-sm">3. Pickup Location</h3>
            <p className="text-xs text-brand-500 mb-4">Choose your preferred warehouse</p>

            <div className="space-y-2 mb-6">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLoc(loc.id)}
                  className={`w-full text-left p-3 rounded-btn border-2 transition-all ${
                    selectedLoc === loc.id ? "border-primary bg-blue-50" : "border-brand-200 hover:border-brand-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-brand-900">{loc.name}</p>
                  <p className="text-xs text-brand-500 mt-0.5">{loc.address}</p>
                </button>
              ))}
            </div>

            {/* Summary */}
            {selectedItems.length > 0 && selectedDate && selectedTime && (
              <div className="bg-brand-50 rounded-btn border border-brand-200 p-3 mb-4 text-xs space-y-1">
                <p className="text-brand-600"><span className="font-bold text-brand-800">{selectedItems.length}</span> item{selectedItems.length !== 1 ? "s" : ""}</p>
                <p className="text-brand-600">
                  <span className="font-bold text-brand-800">{new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
                  {" · "}{selectedTime}
                </p>
              </div>
            )}

            <button
              onClick={handleSchedule}
              disabled={!selectedItems.length || !selectedDate || !selectedTime || !selectedLoc || submitting}
              className="w-full py-3 bg-cta-gradient text-white font-bold rounded-btn disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {submitting ? "Scheduling..." : "Confirm Pickup"}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation */}
      {view === "confirmation" && confirmation && (
        <div className="max-w-lg mx-auto bg-white rounded-card border border-brand-200 shadow-elevated p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📦</div>
          <h2 className="font-black text-brand-900 text-xl mb-2">Pickup Confirmed!</h2>
          <p className="text-brand-500 text-sm mb-5">
            Confirmation: <span className="font-mono font-bold text-brand-800">{confirmation.confirmation_id}</span>
          </p>
          <div className="bg-brand-50 rounded-btn border border-brand-200 p-4 text-sm text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-brand-500">Date</span>
              <span className="font-semibold text-brand-900">
                {new Date(confirmation.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">Time</span>
              <span className="font-semibold text-brand-900">{confirmation.time_slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">Location</span>
              <span className="font-semibold text-brand-900 text-right max-w-xs">{confirmation.location?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">Items</span>
              <span className="font-semibold text-brand-900">{confirmation.items?.length} item{confirmation.items?.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <button
            onClick={() => { setView("schedule"); setConfirmation(null); setSelectedItems([]); setSelectedDate(""); setSelectedTime(""); }}
            className="px-6 py-2.5 bg-hero-gradient text-white font-bold rounded-btn hover:opacity-90 transition-opacity"
          >
            Schedule Another
          </button>
        </div>
      )}

      {/* Check-In sub-tab */}
      {view === "checkin" && (
        <div className="max-w-lg mx-auto">
          <CheckInEmbed />
        </div>
      )}
    </div>
  );
}

// Inline lightweight check-in widget (reuses existing CheckInPanel logic)
import CheckInPanel from "../components/CheckInPanel";
function CheckInEmbed() {
  return <CheckInPanel />;
}

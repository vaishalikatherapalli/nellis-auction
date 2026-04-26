import { useState, useEffect } from "react";
import { batchScan, getPendingPickup, updatePickup } from "../api";
import StatusBadge from "./StatusBadge";

export default function PickupPanel() {
  const [pending, setPending] = useState({ items: [], efficiency: {} });
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [checked, setChecked] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    getPendingPickup().then(setPending).catch(() => {});
  }, []);

  const handleScan = async () => {
    const lots = scanInput.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
    if (!lots.length) return;
    setScanning(true);
    try {
      const result = await batchScan(lots);
      setScanResult(result);
    } catch {
      setToast("Scan failed. Check the backend.");
    } finally {
      setScanning(false);
    }
  };

  const markPickedUp = async (item) => {
    try {
      await updatePickup(item.id, "completed");
      setChecked(prev => ({ ...prev, [item.id]: true }));
      setToast(`${item.lot} marked as picked up!`);
      setTimeout(() => setToast(""), 3000);
      getPendingPickup().then(setPending);
    } catch {
      setToast("Update failed.");
    }
  };

  const activeItems = scanResult ? scanResult.found : pending.items;
  const efficiency = scanResult ? scanResult.efficiency : pending.efficiency;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-5 py-3 rounded-cta shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* Batch scan */}
      <div className="bg-white rounded-cta border border-brand-300 p-6">
        <h3 className="text-sm font-semibold text-brand-900 mb-1">Batch Scan</h3>
        <p className="text-xs text-brand-500 mb-4">
          Paste lot numbers (comma or newline separated) to get an optimized pickup route.
        </p>
        <textarea
          value={scanInput}
          onChange={e => setScanInput(e.target.value)}
          placeholder={"LOT-4190\nLOT-4312\nLOT-4455"}
          rows={4}
          className="w-full border border-brand-300 rounded-cta px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <button
          onClick={handleScan}
          disabled={scanning}
          className="mt-3 px-5 py-2.5 bg-hero-gradient  text-white text-sm font-semibold rounded-cta transition-colors disabled:opacity-50"
        >
          {scanning ? "Scanning..." : "⚡ Scan & Optimize Route"}
        </button>

        {scanResult?.not_found?.length > 0 && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-cta p-3">
            <p className="text-xs text-red-600 font-medium">Not found / not won:</p>
            <p className="text-xs text-red-500 font-mono mt-1">{scanResult.not_found.join(", ")}</p>
          </div>
        )}
      </div>

      {/* Route stats */}
      {efficiency?.total_items > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            ["Items", efficiency.total_items],
            ["Est. Time", `${efficiency.estimated_minutes} min`],
            ["Rows", efficiency.rows_visited?.join(" → ") || "—"],
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-cta border border-brand-300 p-4 text-center">
              <p className="text-xs text-brand-500 mb-1">{label}</p>
              <p className="font-semibold text-brand-900 text-sm">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Optimized checklist */}
      {activeItems.length > 0 && (
        <div className="bg-white rounded-cta border border-brand-300 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-900">
              Optimized Pickup Route
              <span className="ml-2 text-xs font-normal text-brand-500">
                {activeItems.filter(i => checked[i.id]).length}/{activeItems.length} done
              </span>
            </h3>
            {scanResult && (
              <button
                onClick={() => { setScanResult(null); setScanInput(""); }}
                className="text-xs text-brand-500 hover:text-brand-700"
              >
                ← Show all pending
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${checked[item.id] ? "bg-brand-100 opacity-60" : "hover:bg-brand-100"}`}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-primary text-xs font-bold shrink-0">
                  {item.pickup_sequence}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-brand-900 ${checked[item.id] ? "line-through" : ""}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-mono text-brand-500">{item.lot}</span>
                    <span className="text-xs text-brand-600">{item.location}</span>
                  </div>
                </div>
                <StatusBadge status={item.pickup_status || item.status} />
                <button
                  onClick={() => markPickedUp(item)}
                  disabled={checked[item.id]}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors shrink-0 ${
                    checked[item.id]
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-white text-brand-700 border-brand-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                  }`}
                >
                  {checked[item.id] ? "✓ Done" : "Mark Picked Up"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeItems.length === 0 && !scanning && (
        <div className="text-center py-16 bg-white rounded-cta border border-brand-300 text-brand-500">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium text-brand-700">No pending pickups</p>
          <p className="text-sm mt-1">All items have been picked up, or use batch scan above.</p>
        </div>
      )}
    </div>
  );
}

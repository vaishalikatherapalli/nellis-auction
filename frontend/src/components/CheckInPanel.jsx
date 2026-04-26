import { useState, useEffect } from "react";
import { getProfile, updatePlates, checkinByPlate, checkinByQR } from "../api";
import PickupPanel from "./PickupPanel";

// ── Camera viewfinder ─────────────────────────────────────
function Viewfinder({ state }) {
  const borderColor =
    state === "success"  ? "border-green-500" :
    state === "failed"   ? "border-red-500"   :
    state === "scanning" ? "border-primary"   :
    "border-brand-700";

  return (
    <div className={`relative w-full h-44 bg-brand-900 rounded-cta border-2 ${borderColor} ${
      state === "success" ? "animate-pulse-green" : state === "failed" ? "animate-shake" : ""
    } overflow-hidden transition-colors duration-300`}>
      {[["top-2 left-2","border-t-2 border-l-2"],["top-2 right-2","border-t-2 border-r-2"],
        ["bottom-2 left-2","border-b-2 border-l-2"],["bottom-2 right-2","border-b-2 border-r-2"]
      ].map(([pos, border], i) => (
        <div key={i} className={`absolute ${pos} w-5 h-5 ${border} border-primary rounded-sm`} />
      ))}

      {state === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🚗</span>
          <p className="text-brand-500 text-xs">Camera ready</p>
        </div>
      )}
      {state === "scanning" && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-primary text-xs font-mono animate-pulse font-bold tracking-widest">READING PLATE...</p>
          </div>
          <div className="animate-scan absolute left-0 right-0 h-0.5 bg-primary opacity-80" style={{ top: 8 }} />
        </>
      )}
      {state === "success" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-green-900/30">
          <span className="text-3xl">✅</span>
          <p className="text-green-400 text-sm font-bold">Plate Recognized</p>
        </div>
      )}
      {state === "failed" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-900/30">
          <span className="text-3xl">❌</span>
          <p className="text-red-400 text-sm font-bold">Plate Not Found</p>
        </div>
      )}
    </div>
  );
}

// ── QR viewfinder ───────────────────────────────────────���─
function QRViewfinder({ state }) {
  return (
    <div className={`relative w-full h-44 bg-brand-900 rounded-cta border-2 overflow-hidden transition-colors duration-300 ${
      state === "success"  ? "border-green-500" :
      state === "scanning" ? "border-burgundy-600" :
      "border-brand-700"
    }`}>
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="grid grid-cols-6 grid-rows-6 gap-1 w-28 h-28">
          {[...Array(36)].map((_, i) => (
            <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? "bg-white" : "bg-transparent"}`} />
          ))}
        </div>
      </div>
      {[["top-2 left-2","border-t-2 border-l-2"],["top-2 right-2","border-t-2 border-r-2"],
        ["bottom-2 left-2","border-b-2 border-l-2"],["bottom-2 right-2","border-b-2 border-r-2"]
      ].map(([pos, border], i) => (
        <div key={i} className={`absolute ${pos} w-5 h-5 ${border} border-burgundy-600 rounded-sm`} />
      ))}
      {state === "idle" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-brand-500 text-xs">Point camera at QR code</p>
        </div>
      )}
      {state === "scanning" && (
        <>
          <div className="animate-scan absolute left-0 right-0 h-0.5 bg-burgundy-600" style={{ top: 8 }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-burgundy-100 text-xs font-mono animate-pulse font-bold tracking-widest">SCANNING QR...</p>
          </div>
        </>
      )}
      {state === "success" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-green-900/30">
          <span className="text-3xl">✅</span>
          <p className="text-green-400 text-sm font-bold">QR Recognized</p>
        </div>
      )}
    </div>
  );
}

// ── Success screen ────────────────────────────────────────
function CheckInSuccess({ data, onReset }) {
  return (
    <div className="space-y-4">
      <div className="bg-burgundy-50 border border-burgundy-100 rounded-cta p-5 shadow-itemCard">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-burgundy-900 font-black text-lg">Welcome, {data.customer_name}! 👋</p>
            <p className="text-burgundy-800 text-sm mt-0.5">
              {data.items.length} item{data.items.length !== 1 ? "s" : ""} ready for pickup
            </p>
          </div>
          {data.bay && (
            <div className="bg-cta-gradient text-white rounded-cta px-4 py-2 text-center shrink-0">
              <p className="text-xs font-medium opacity-80">Proceed to</p>
              <p className="text-xl font-black">{data.bay}</p>
            </div>
          )}
        </div>
        {data.efficiency?.rows_visited?.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-burgundy-800">
            <span>🗺️ Route:</span>
            <span className="font-semibold">{data.efficiency.rows_visited.join(" → ")}</span>
            <span className="text-burgundy-600">· ~{data.efficiency.estimated_minutes} min</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-cta border border-brand-300 shadow-itemCard overflow-hidden">
        <div className="px-5 py-3 border-b border-brand-200 bg-brand-100">
          <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">Items Being Staged</p>
        </div>
        <div className="divide-y divide-brand-200">
          {data.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-6 h-6 rounded-full bg-burgundy-50 text-burgundy-900 text-xs font-black flex items-center justify-center shrink-0 border border-burgundy-100">
                {item.pickup_sequence}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-900 truncate">{item.title}</p>
                <p className="text-xs text-brand-500 font-mono">{item.lot} · {item.location}</p>
              </div>
              <span className="text-xs text-primary font-bold shrink-0">${item.my_bid}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onReset} className="w-full py-2.5 text-sm text-brand-600 hover:text-brand-900 border border-brand-300 rounded-cta bg-white transition-colors font-semibold">
        ← Start New Check-In
      </button>
    </div>
  );
}

// ── Profile / Plate Registration ──────────────────────────
function ProfilePanel({ profile, onSaved }) {
  const [plates, setPlates] = useState(profile?.plates || []);
  const [input,  setInput]  = useState("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const addPlate = () => {
    const val = input.trim().toUpperCase();
    if (!val) return;
    if (plates.length >= 3) { setError("Maximum 3 plates allowed."); return; }
    if (plates.map(p => p.replace(/[-\s]/g,"")).includes(val.replace(/[-\s]/g,""))) {
      setError("Plate already registered."); return;
    }
    setPlates([...plates, val]);
    setInput("");
    setError("");
  };

  const save = async () => {
    setSaving(true);
    try { onSaved(await updatePlates(plates)); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-cta border border-brand-300 shadow-itemCard p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-brand-900">Registered Plates</h3>
        <p className="text-xs text-brand-500 mt-0.5">Up to 3 plates. Used for automatic check-in.</p>
      </div>

      <div className="space-y-2">
        {plates.length === 0 && <p className="text-xs text-brand-400 italic">No plates registered.</p>}
        {plates.map((plate, i) => (
          <div key={i} className="flex items-center gap-2 bg-brand-100 border border-brand-300 rounded-cta px-3 py-2">
            <span className="text-sm">🚗</span>
            <span className="font-mono text-sm font-bold text-brand-900 flex-1 tracking-widest">{plate}</span>
            <button onClick={() => setPlates(plates.filter((_,idx)=>idx!==i))}
              className="text-brand-400 hover:text-primary text-lg leading-none transition-colors">×</button>
          </div>
        ))}
      </div>

      {plates.length < 3 && (
        <div className="flex gap-2">
          <input value={input}
            onChange={e => { setInput(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={e => e.key === "Enter" && addPlate()}
            placeholder="TX-ABC1234"
            className="flex-1 border border-brand-300 rounded-cta px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={addPlate}
            className="px-4 py-2 bg-cta-gradient text-white text-sm rounded-cta font-semibold hover:opacity-90 transition-opacity">
            Add
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button onClick={save} disabled={saving}
        className="w-full py-2.5 bg-cta-gradient text-white text-sm font-bold rounded-cta hover:opacity-90 transition-opacity disabled:opacity-50">
        {saving ? "Saving..." : "Save Plates"}
      </button>

      <div className="pt-2 border-t border-brand-200">
        <p className="text-xs text-brand-500">
          <span className="font-bold text-brand-700">Customer ID:</span>{" "}
          <span className="font-mono">{profile?.customer_id}</span>
          <span className="ml-2 text-brand-400">· Use this as QR fallback</span>
        </p>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────
export default function CheckInPanel() {
  const [profile,    setProfile]    = useState(null);
  const [view,       setView]       = useState("plate");
  const [plateInput, setPlateInput] = useState("");
  const [qrInput,    setQrInput]    = useState("");
  const [scanState,  setScanState]  = useState("idle");
  const [qrState,    setQrState]    = useState("idle");
  const [checkinData,setCheckinData]= useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => { getProfile().then(setProfile); }, []);

  const simulatePlateScan = async () => {
    if (!plateInput.trim()) return;
    setScanState("scanning");
    await new Promise(r => setTimeout(r, 2000));
    setLoading(true);
    try {
      const res = await checkinByPlate(plateInput.trim());
      if (res.success) {
        setScanState("success");
        await new Promise(r => setTimeout(r, 800));
        setCheckinData(res);
      } else {
        setScanState("failed");
        await new Promise(r => setTimeout(r, 1200));
        setView("qr"); setScanState("idle");
      }
    } catch {
      setScanState("failed");
      await new Promise(r => setTimeout(r, 1200));
      setScanState("idle");
    } finally { setLoading(false); }
  };

  const simulateQRScan = async () => {
    if (!qrInput.trim()) return;
    setQrState("scanning");
    await new Promise(r => setTimeout(r, 1500));
    setLoading(true);
    try {
      const res = await checkinByQR(qrInput.trim());
      setQrState("success");
      await new Promise(r => setTimeout(r, 800));
      setCheckinData(res);
    } catch { setQrState("idle"); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setCheckinData(null); setScanState("idle"); setQrState("idle");
    setPlateInput(""); setQrInput(""); setView("plate");
  };

  if (checkinData) return (
    <div className="space-y-4 max-w-lg mx-auto">
      <CheckInSuccess data={checkinData} onReset={reset} />
      <button onClick={() => { reset(); setView("pickup"); }}
        className="w-full py-3 bg-cta-gradient text-white text-sm font-bold rounded-cta hover:opacity-90 transition-opacity">
        📦 Go to Pickup Queue →
      </button>
    </div>
  );

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Sub-tab switcher */}
      <div className="flex bg-white border border-brand-300 rounded-cta shadow-itemCard overflow-hidden">
        {[
          ["plate",   "🚗 Plate Scan"],
          ["qr",      "📱 QR Fallback"],
          ["pickup",  "📦 Pickup Queue"],
          ["profile", "⚙️ My Plates"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 ${
              view === id
                ? "border-primary text-primary bg-burgundy-50"
                : "border-transparent text-brand-600 hover:text-brand-900 hover:bg-brand-100"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Plate Scan */}
      {view === "plate" && (
        <div className="space-y-4">
          <div className="bg-white rounded-cta border border-brand-300 shadow-itemCard p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-brand-900">License Plate Check-In</h3>
              <p className="text-xs text-brand-500 mt-0.5">Camera reads your plate automatically. Enter it below to simulate.</p>
            </div>

            <Viewfinder state={scanState} />

            <div className="flex gap-2">
              <input value={plateInput}
                onChange={e => setPlateInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && simulatePlateScan()}
                placeholder="TX-ABC1234"
                disabled={scanState === "scanning" || loading}
                className="flex-1 border border-brand-300 rounded-cta px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button onClick={simulatePlateScan}
                disabled={!plateInput.trim() || scanState === "scanning" || loading}
                className="px-5 py-2.5 bg-cta-gradient text-white text-sm font-bold rounded-cta hover:opacity-90 transition-opacity disabled:opacity-40">
                {scanState === "scanning" ? "Scanning..." : "Scan"}
              </button>
            </div>

            <div className="bg-brand-100 rounded-cta p-3 space-y-1.5">
              <p className="text-xs font-bold text-brand-600">Registered plates — try these:</p>
              <div className="flex gap-2 flex-wrap">
                {profile?.plates?.map(p => (
                  <button key={p} onClick={() => setPlateInput(p)}
                    className="font-mono text-xs bg-white border border-brand-300 px-2.5 py-1 rounded-cta hover:border-primary hover:text-primary transition-colors font-semibold">
                    {p}
                  </button>
                ))}
                <button onClick={() => setPlateInput("XX-UNKNOWN")}
                  className="font-mono text-xs bg-white border border-brand-300 px-2.5 py-1 rounded-cta hover:border-red-400 text-red-400 transition-colors">
                  XX-UNKNOWN (test fallback)
                </button>
              </div>
            </div>
          </div>

          <button onClick={() => setView("qr")}
            className="w-full py-2.5 text-sm text-brand-600 hover:text-brand-900 border border-brand-300 rounded-cta bg-white transition-colors font-semibold">
            Plate not working? → Use QR fallback
          </button>
        </div>
      )}

      {/* QR Fallback */}
      {view === "qr" && (
        <div className="bg-white rounded-cta border border-brand-300 shadow-itemCard p-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="bg-amber-100 text-amber-700 rounded-[6.25rem] px-3 py-1 text-xs font-bold shrink-0">Fallback</span>
            <div>
              <h3 className="text-sm font-bold text-brand-900">QR Code Check-In</h3>
              <p className="text-xs text-brand-500 mt-0.5">Show your QR code to the scanner, or enter your Customer ID below.</p>
            </div>
          </div>

          <QRViewfinder state={qrState} />

          <div className="border-t border-brand-200 pt-3 space-y-2">
            <p className="text-xs text-brand-500 text-center">Or enter Customer ID manually</p>
            <div className="flex gap-2">
              <input value={qrInput}
                onChange={e => setQrInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && simulateQRScan()}
                placeholder="CUST-7291"
                disabled={qrState === "scanning" || loading}
                className="flex-1 border border-brand-300 rounded-cta px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-burgundy-600 disabled:opacity-50"
              />
              <button onClick={simulateQRScan}
                disabled={!qrInput.trim() || qrState === "scanning" || loading}
                className="px-5 py-2.5 bg-burgundy-900 hover:bg-burgundy-800 text-white text-sm font-bold rounded-cta transition-colors disabled:opacity-40">
                {qrState === "scanning" ? "Checking..." : "Check In"}
              </button>
            </div>
            {profile && (
              <button onClick={() => setQrInput(profile.customer_id)}
                className="w-full text-xs text-brand-500 hover:text-primary py-1 font-semibold transition-colors">
                Use my ID: {profile.customer_id}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pickup Queue */}
      {view === "pickup" && <PickupPanel />}

      {/* My Plates */}
      {view === "profile" && profile && (
        <ProfilePanel profile={profile} onSaved={p => { setProfile(p); setView("plate"); }} />
      )}
    </div>
  );
}

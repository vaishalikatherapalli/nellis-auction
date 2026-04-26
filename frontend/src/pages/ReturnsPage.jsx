import { useState, useEffect } from "react";
import { getItems, submitReturn, getReturns } from "../api";

const REASONS = [
  "Item not as described",
  "Damaged / defective",
  "Wrong item received",
  "Changed my mind",
  "Better price found",
  "Other",
];

const STATUS_COLOR = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  completed:"bg-teal-50 text-teal-700 border-teal-100",
};

export default function ReturnsPage() {
  const [step,       setStep]       = useState(1);
  const [wonItems,   setWonItems]   = useState([]);
  const [returns,    setReturns]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [reason,     setReason]     = useState("");
  const [notes,      setNotes]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    getItems({ status: "won" }).then(setWonItems).catch(() => {});
    getItems({ status: "picked_up" }).then(p => setWonItems(prev => [...prev, ...p])).catch(() => {});
    getReturns().then(setReturns).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!selected || !reason) return;
    setSubmitting(true);
    try {
      const result = await submitReturn({ item_id: selected.id, reason, notes });
      setConfirmation(result);
      setReturns(prev => [result, ...prev]);
      setStep(4);
    } catch { /* show nothing, demo */ }
    finally { setSubmitting(false); }
  };

  const reset = () => { setStep(1); setSelected(null); setReason(""); setNotes(""); setConfirmation(null); };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-900">Returns</h1>
        <p className="text-brand-500 text-sm mt-1">Request a return on any won item within 3 days of pickup.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Return wizard */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-card border border-brand-200 shadow-card overflow-hidden">

            {/* Progress */}
            <div className="flex border-b border-brand-200">
              {["Select Item", "Select Reason", "Review & Submit", "Confirmation"].map((label, i) => (
                <div key={label} className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                  step === i + 1 ? "border-primary text-primary" :
                  step > i + 1  ? "border-green-500 text-green-600" :
                  "border-transparent text-brand-400"
                }`}>
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-1 ${
                    step > i + 1 ? "bg-green-100 text-green-700" :
                    step === i + 1 ? "bg-blue-100 text-primary" : "bg-brand-100 text-brand-400"
                  }`}>{step > i + 1 ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>

            <div className="p-6">
              {/* Step 1 — Select item */}
              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-brand-900 mb-4">Which item would you like to return?</h3>
                  {wonItems.length === 0 && (
                    <p className="text-brand-500 text-sm py-8 text-center">No eligible items found. Only won or picked-up items can be returned.</p>
                  )}
                  {wonItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-btn border-2 transition-all ${
                        selected?.id === item.id ? "border-primary bg-blue-50" : "border-brand-200 hover:border-brand-400"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected?.id === item.id ? "border-primary bg-primary" : "border-brand-300"
                      }`}>
                        {selected?.id === item.id && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-brand-900 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-brand-500 font-mono">{item.lot} · Won for ${item.my_bid}</p>
                      </div>
                    </button>
                  ))}
                  <div className="pt-4">
                    <button
                      onClick={() => selected && setStep(2)}
                      disabled={!selected}
                      className="w-full py-3 bg-hero-gradient text-white font-bold rounded-btn disabled:opacity-40 hover:opacity-90 transition-opacity"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — Reason */}
              {step === 2 && (
                <div>
                  <h3 className="font-bold text-brand-900 mb-1">Why are you returning this item?</h3>
                  <p className="text-sm text-brand-500 mb-5">Returning: <span className="font-semibold text-brand-800">{selected?.title}</span></p>
                  <div className="space-y-2 mb-5">
                    {REASONS.map(r => (
                      <button
                        key={r}
                        onClick={() => setReason(r)}
                        className={`w-full text-left px-4 py-3 rounded-btn border-2 text-sm font-medium transition-all ${
                          reason === r ? "border-primary bg-blue-50 text-primary" : "border-brand-200 text-brand-700 hover:border-brand-400"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border border-brand-300 rounded-btn text-sm font-semibold text-brand-700 hover:bg-brand-100">← Back</button>
                    <button onClick={() => reason && setStep(3)} disabled={!reason} className="flex-1 py-3 bg-hero-gradient text-white font-bold rounded-btn disabled:opacity-40 hover:opacity-90 transition-opacity">Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <div>
                  <h3 className="font-bold text-brand-900 mb-4">Review your return request</h3>
                  <div className="bg-brand-50 rounded-btn border border-brand-200 p-4 mb-5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-500">Item</span>
                      <span className="font-semibold text-brand-900 text-right max-w-xs truncate">{selected?.title}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-500">Lot</span>
                      <span className="font-mono text-brand-700">{selected?.lot}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-500">Reason</span>
                      <span className="font-semibold text-brand-900">{reason}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-500">Refund</span>
                      <span className="font-bold text-green-700">${selected?.my_bid}</span>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-brand-700 mb-2">Additional notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Describe any damage or issues..."
                      className="w-full border border-brand-300 rounded-btn px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 border border-brand-300 rounded-btn text-sm font-semibold text-brand-700 hover:bg-brand-100">← Back</button>
                    <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 bg-cta-gradient text-white font-bold rounded-btn disabled:opacity-50 hover:opacity-90 transition-opacity">
                      {submitting ? "Submitting..." : "Submit Return"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 — Confirmation */}
              {step === 4 && confirmation && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                  <h3 className="font-black text-brand-900 text-lg mb-2">Return Submitted!</h3>
                  <p className="text-brand-500 text-sm mb-1">Return ID: <span className="font-mono font-bold text-brand-800">RET-{String(confirmation.id).padStart(4, "0")}</span></p>
                  <p className="text-brand-500 text-sm mb-6">Expected refund: <span className="font-bold text-green-700">${confirmation.refund_amount}</span> · Processing in 3-5 business days.</p>
                  <button onClick={reset} className="px-6 py-2.5 bg-hero-gradient text-white font-bold rounded-btn hover:opacity-90 transition-opacity">
                    Start Another Return
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Returns */}
        <div>
          <h2 className="font-bold text-brand-900 mb-4">My Returns</h2>
          {returns.length === 0 ? (
            <div className="bg-white rounded-card border border-brand-200 p-6 text-center text-brand-400 text-sm">
              No returns yet.
            </div>
          ) : (
            <div className="space-y-3">
              {returns.map(r => (
                <div key={r.id} className="bg-white rounded-card border border-brand-200 p-4 shadow-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-brand-900 line-clamp-2">{r.title}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLOR[r.status] || "bg-brand-100 text-brand-500 border-brand-200"}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-500 font-mono">{r.lot}</p>
                  <p className="text-xs text-brand-400 mt-1">{r.reason}</p>
                  <p className="text-xs font-bold text-green-700 mt-1">Refund: ${r.refund_amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

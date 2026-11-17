'use client';
// src/components/header/DeliverTo.tsx
// Header "Deliver to" selector. Uses the EXISTING public endpoint /api/delivery/check
// (pincode / lat-lng). The chosen location is a header preference stored in localStorage only;
// it does not change checkout, delivery or pricing logic.
import { useEffect, useRef, useState } from 'react';

type Loc = { label: string; pin?: string; status: 'ok' | 'pending' | 'outside'; note?: string };
const KEY = 'kpc_delivery_loc';
const EVT = 'kpc-delivery-change';

function readLoc(): Loc | null {
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}
function saveLoc(l: Loc | null) {
  try { l ? localStorage.setItem(KEY, JSON.stringify(l)) : localStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new Event(EVT));
}

export default function DeliverTo({ variant }: { variant: 'desktop' | 'mobile' }) {
  const [loc, setLoc]       = useState<Loc | null>(null);
  const [open, setOpen]     = useState(false);
  const [pin, setPin]       = useState('');
  const [busy, setBusy]     = useState(false);
  const [msg, setMsg]       = useState<{ text: string; kind: 'ok' | 'warn' | 'err' } | null>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setLoc(readLoc());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener('storage', sync); };
  }, []);

  useEffect(() => {
    if (!open) return;
    setMsg(null); setPin(loc?.pin || '');
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPin = async () => {
    const p = pin.trim();
    if (!/^\d{6}$/.test(p)) { setMsg({ text: 'Enter a valid 6-digit PIN code.', kind: 'err' }); return; }
    setBusy(true); setMsg(null);
    try {
      const res  = await fetch(`/api/delivery/check?pincode=${p}`);
      const data = await res.json().catch(() => ({}));
      if (data?.available) {
        const l: Loc = { label: data.zone?.name || p, pin: p, status: 'ok', note: data.promiseLabel };
        saveLoc(l); setLoc(l); setOpen(false); return;
      }
      if (!p.startsWith('639')) {
        const note = data?.reason || 'We currently deliver only within Karur District.';
        const l: Loc = { label: p, pin: p, status: 'outside', note };
        saveLoc(l); setLoc(l); setMsg({ text: note, kind: 'err' });
      } else {
        const note = 'Delivery is subject to PIN-code serviceability. We confirm exact delivery details at checkout.';
        const l: Loc = { label: p, pin: p, status: 'pending', note };
        saveLoc(l); setLoc(l); setMsg({ text: note, kind: 'warn' });
      }
    } catch {
      setMsg({ text: 'Could not check this PIN right now. Please try again.', kind: 'err' });
    } finally { setBusy(false); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setMsg({ text: 'Location is not supported on this device.', kind: 'err' }); return; }
    setBusy(true); setMsg(null);
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude, longitude } = pos.coords;
        const res  = await fetch(`/api/delivery/check?lat=${latitude}&lng=${longitude}`);
        const data = await res.json().catch(() => ({}));
        if (data?.available) {
          const l: Loc = { label: data.zone?.name || 'Your location', status: 'ok', note: data.promiseLabel };
          saveLoc(l); setLoc(l); setOpen(false);
        } else {
          setMsg({ text: data?.reason || 'This location is outside our delivery coverage.', kind: 'err' });
        }
      } catch { setMsg({ text: 'Could not check your location right now.', kind: 'err' }); }
      finally { setBusy(false); }
    }, () => { setBusy(false); setMsg({ text: 'Location permission was denied. Enter your PIN code instead.', kind: 'err' }); },
    { timeout: 10000 });
  };

  const clear = () => { saveLoc(null); setLoc(null); setPin(''); setMsg(null); };

  return (
    <>
      <button type="button" className={`kp-dl kp-dl--${variant}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="Change delivery location">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <span className="kp-dl-text">
          <span className="kp-dl-top">Deliver to</span>
          <span className="kp-dl-main">{loc ? loc.label : 'Select location'}<span className="kp-dl-caret" aria-hidden="true">▾</span></span>
        </span>
      </button>

      {open && (
        <div className="kp-dl-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="kp-dl-modal" role="dialog" aria-modal="true" aria-label="Choose delivery location">
            <div className="kp-dl-head">
              <div>
                <div className="kp-dl-title">Choose your delivery location</div>
                <div className="kp-dl-sub">Local delivery within 30 km of Karur, subject to product and PIN-code serviceability.</div>
              </div>
              <button type="button" className="kp-dl-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>

            <label className="kp-dl-label" htmlFor={`kp-pin-${variant}`}>Enter PIN code</label>
            <div className="kp-dl-form">
              <input id={`kp-pin-${variant}`} ref={inputRef} className="kp-dl-input" inputMode="numeric" maxLength={6}
                placeholder="e.g. 639001" value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => { if (e.key === 'Enter') applyPin(); }} />
              <button type="button" className="kp-dl-apply" onClick={applyPin} disabled={busy}>{busy ? '…' : 'APPLY'}</button>
            </div>

            <div className="kp-dl-or"><span>or</span></div>
            <button type="button" className="kp-dl-geo" onClick={useMyLocation} disabled={busy}>◎ Use my current location</button>

            {msg && <div className={`kp-dl-msg kp-dl-msg--${msg.kind}`} role="status">{msg.text}</div>}
            {loc && !msg && (
              <div className="kp-dl-cur">
                Current: <strong>{loc.label}</strong>{loc.note ? ` — ${loc.note}` : ''}
                <button type="button" className="kp-dl-clear" onClick={clear}>Clear</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .kp-dl { display:flex; align-items:center; gap:8px; background:none; border:none; cursor:pointer; color:#fff; font-family:'Inter',sans-serif; text-align:left; padding:0; }
        .kp-dl-text { display:flex; flex-direction:column; line-height:1.15; }
        .kp-dl-top { font-size:.68rem; opacity:.75; }
        .kp-dl-main { font-size:.86rem; font-weight:700; white-space:nowrap; max-width:150px; overflow:hidden; text-overflow:ellipsis; }
        .kp-dl-caret { margin-left:4px; font-size:.7rem; }
        .kp-dl--mobile { color:#0B2447; width:100%; }
        .kp-dl--mobile .kp-dl-text { flex-direction:row; gap:6px; align-items:baseline; }
        .kp-dl--mobile .kp-dl-top { opacity:.7; font-size:.74rem; }
        .kp-dl--mobile .kp-dl-main { font-size:.8rem; max-width:none; }
        .kp-dl-overlay { position:fixed; inset:0; background:rgba(7,15,31,.55); z-index:900; display:flex; align-items:flex-start; justify-content:center; padding:96px 16px 16px; }
        .kp-dl-modal { background:#fff; border-radius:12px; width:100%; max-width:420px; padding:22px; box-shadow:0 24px 60px rgba(7,15,31,.35); color:#0B2447; font-family:'Inter',sans-serif; }
        .kp-dl-head { display:flex; justify-content:space-between; gap:12px; margin-bottom:16px; }
        .kp-dl-title { font-weight:700; font-size:1rem; }
        .kp-dl-sub { font-size:.74rem; color:#6B7280; margin-top:4px; line-height:1.5; }
        .kp-dl-x { background:none; border:none; font-size:1rem; cursor:pointer; color:#6B7280; align-self:flex-start; }
        .kp-dl-label { display:block; font-size:.74rem; font-weight:600; margin-bottom:6px; }
        .kp-dl-form { display:flex; gap:8px; }
        .kp-dl-input { flex:1; height:42px; border:1px solid #D9D4CC; border-radius:6px; padding:0 12px; font-size:.95rem; letter-spacing:.12em; outline:none; font-family:'Inter',sans-serif; }
        .kp-dl-input:focus { border-color:#F07316; }
        .kp-dl-apply { height:42px; padding:0 18px; border:none; border-radius:6px; background:#F07316; color:#fff; font-weight:700; font-size:.78rem; letter-spacing:.06em; cursor:pointer; }
        .kp-dl-apply:disabled, .kp-dl-geo:disabled { opacity:.6; cursor:wait; }
        .kp-dl-or { text-align:center; margin:14px 0; position:relative; font-size:.72rem; color:#9CA3AF; }
        .kp-dl-or::before { content:''; position:absolute; left:0; right:0; top:50%; border-top:1px solid #E5E1DC; }
        .kp-dl-or span { position:relative; background:#fff; padding:0 10px; }
        .kp-dl-geo { width:100%; height:42px; border:1.5px solid #0B2447; background:#fff; color:#0B2447; border-radius:6px; font-weight:700; font-size:.8rem; cursor:pointer; }
        .kp-dl-geo:hover { background:#0B2447; color:#fff; }
        .kp-dl-msg { margin-top:14px; font-size:.78rem; line-height:1.5; padding:10px 12px; border-radius:6px; }
        .kp-dl-msg--err { background:#FEF2F2; color:#991B1B; }
        .kp-dl-msg--warn { background:#FFF7ED; color:#9A3412; }
        .kp-dl-cur { margin-top:14px; font-size:.76rem; color:#4B5563; line-height:1.5; }
        .kp-dl-clear { margin-left:8px; background:none; border:none; color:#F07316; font-weight:700; cursor:pointer; font-size:.76rem; }
        @media(max-width:960px){ .kp-dl-overlay { padding-top:72px; } }
      `}</style>
    </>
  );
}

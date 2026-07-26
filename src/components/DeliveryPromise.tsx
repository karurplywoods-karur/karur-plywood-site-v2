'use client';
// src/components/DeliveryPromise.tsx
// "Never show exact stock quantities... display Delivery Promise instead."
// Renders on every product page. Tries browser geolocation first (radius-based,
// most accurate); falls back to a manual area name if the customer declines
// or geolocation fails.
import { useState, useEffect, useCallback } from 'react';

interface DeliveryCheckResult {
  available: boolean;
  reason?: string;
  contactWhatsApp?: boolean;
  zone?: { code: string; name: string };
  distanceKm?: number;
  promiseLabel?: string;
  cutoffTimeLabel?: string;
  isBeforeCutoff?: boolean;
  estimatedDeliveryDate?: string;
  isBusinessHours?: boolean;
  verificationSlaMinutes?: number;
}

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
}

export default function DeliveryPromise() {
  const [status, setStatus] = useState<'idle' | 'locating' | 'loading' | 'done' | 'manual'>('idle');
  const [result, setResult] = useState<DeliveryCheckResult | null>(null);
  const [manualArea, setManualArea] = useState('');

  const checkByCoords = useCallback(async (lat: number, lng: number) => {
    setStatus('loading');
    try {
      const res = await fetch(`/api/delivery/check?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ available: false, reason: 'Could not check delivery right now.', contactWhatsApp: true });
    }
    setStatus('done');
  }, []);

  const checkByArea = useCallback(async (city: string) => {
    if (!city.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`/api/delivery/check?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ available: false, reason: 'Could not check delivery right now.', contactWhatsApp: true });
    }
    setStatus('done');
  }, []);

  const tryGeolocation = useCallback(() => {
    if (!navigator.geolocation) { setStatus('manual'); return; }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => checkByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setStatus('manual'), // denied / unavailable — fall back to manual entry
      { timeout: 8000 }
    );
  }, [checkByCoords]);

  useEffect(() => { tryGeolocation(); }, [tryGeolocation]);

  return (
    <div className="dp-card">
      <div className="dp-header">🚚 Delivery Promise</div>

      {(status === 'locating' || status === 'loading') && (
        <p className="dp-muted">Checking delivery for your area…</p>
      )}

      {status === 'manual' && (
        <div className="dp-manual">
          <p className="dp-muted">Enter your area to check delivery timing:</p>
          <div className="dp-manual-row">
            <input
              type="text"
              placeholder="e.g. Thanthoni, Kulithalai"
              value={manualArea}
              onChange={(e) => setManualArea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkByArea(manualArea)}
            />
            <button type="button" onClick={() => checkByArea(manualArea)}>Check</button>
          </div>
        </div>
      )}

      {status === 'done' && result && result.available && (
        <div className="dp-result dp-result--available">
          <p className="dp-zone">✓ Usually Available — {result.zone?.name}</p>
          <p className="dp-promise">
            {result.isBeforeCutoff ? 'Order before' : 'Order after'} {result.cutoffTimeLabel} → <strong>{result.promiseLabel}</strong>
          </p>
          {result.estimatedDeliveryDate && (
            <p className="dp-eta">Estimated delivery: {formatDate(result.estimatedDeliveryDate)}</p>
          )}
          <p className="dp-sla">
            Availability confirmed within {result.verificationSlaMinutes ?? 15} minutes during business hours.
          </p>
        </div>
      )}

      {status === 'done' && result && !result.available && (
        <div className="dp-result dp-result--unavailable">
          <p>{result.reason}</p>
          {result.contactWhatsApp && (
            <a href="/contact" className="dp-whatsapp-link">Check on WhatsApp →</a>
          )}
        </div>
      )}

      <p className="dp-footer">Payment requested only after confirmation.</p>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .dp-card {
    border: 1.5px solid #E5E1DC;
    border-radius: 12px;
    padding: 16px;
    background: #FAF8F5;
    font-family: 'Inter', sans-serif;
  }
  .dp-header { font-weight: 800; color: #0B2447; margin-bottom: 10px; font-size: 0.95rem; }
  .dp-muted { color: #6B7280; font-size: 0.85rem; margin: 0; }
  .dp-manual-row { display: flex; gap: 8px; margin-top: 6px; }
  .dp-manual-row input {
    flex: 1; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #E5E1DC;
    font-size: 0.85rem; font-family: inherit;
  }
  .dp-manual-row button {
    padding: 8px 14px; border-radius: 8px; border: none; background: #F07316;
    color: #fff; font-weight: 700; font-size: 0.8rem; cursor: pointer;
  }
  .dp-result--available .dp-zone { color: #0B2447; font-weight: 700; margin: 0 0 4px; font-size: 0.88rem; }
  .dp-result--available .dp-promise { color: #16803D; font-size: 0.85rem; margin: 0 0 4px; }
  .dp-result--available .dp-eta { color: #374151; font-size: 0.82rem; margin: 0 0 6px; }
  .dp-result--available .dp-sla { color: #6B7280; font-size: 0.76rem; margin: 0; }
  .dp-result--unavailable p { color: #92400E; font-size: 0.85rem; margin: 0 0 6px; }
  .dp-whatsapp-link { color: #F07316; font-weight: 700; font-size: 0.82rem; text-decoration: none; }
  .dp-footer { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #E5E1DC; color: #9CA3AF; font-size: 0.72rem; }
`;

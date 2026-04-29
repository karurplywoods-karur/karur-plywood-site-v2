'use client';
// src/components/WhatsAppWidget.tsx
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { trackWAClick, generateTrackingId } from '@/lib/analytics';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

const QUICK_MESSAGES = [
  { label: '🪵 Plywood Pricing',   text: 'Hi, I need plywood for my project. Can you share pricing and available sizes?',   category: 'Plywood' },
  { label: '🚪 Door Enquiry',      text: "Hi, I'm looking for doors for my home. What options and prices do you have?",      category: 'Doors' },
  { label: '🎨 Laminate Designs',  text: 'Hi, I need laminate sheet designs for my kitchen/bedroom. Can you help?',          category: 'Laminates' },
  { label: '🔩 Hardware Fittings', text: 'Hi, I need hardware fittings for my furniture. What do you have available?',       category: 'Hardware' },
  { label: '📦 Bulk / Wholesale',  text: "Hi, I'm a contractor and need bulk pricing. Can we discuss wholesale rates?",      category: 'Wholesale' },
  { label: '📍 Showroom Visit',    text: "Hi, I'd like to visit your Karur showroom. What are your working hours?",          category: 'Showroom' },
];

function WAIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');

  if (pathname.startsWith('/admin')) return null;

  const send = useCallback((text: string, category?: string) => {
    trackWAClick({ source: 'widget', category });
    const trackingId = generateTrackingId();
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Widget Click', phone: 'N/A', message: text,
        tracking_id: trackingId, source: 'website', wa_source: 'widget', category,
      }),
    }).catch(() => {});
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
  }, []);

  const sendCustom = useCallback(() => {
    if (!custom.trim()) return;
    send(custom);
    setCustom('');
  }, [custom, send]);

  return (
    <>
      {/* Chat Panel — hardcoded hex colors so CSS vars can't fail */}
      {open && (
        <div className="wa-panel">
          {/* Header */}
          <div className="wa-panel-header">
            <div className="wa-panel-avatar">🪵</div>
            <div className="wa-panel-info">
              <div className="wa-panel-name">Karur Plywood &amp; Co.</div>
              <div className="wa-panel-status">
                <span className="wa-online-dot" />
                Usually replies within minutes
              </div>
            </div>
            <button className="wa-panel-close" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>

          {/* Greeting bubble */}
          <div className="wa-panel-body">
            <div className="wa-bubble">
              <p className="wa-bubble-text">👋 Hi! What can we help you with today?</p>
              <span className="wa-bubble-time">Now ✓✓</span>
            </div>
          </div>

          {/* Quick message buttons */}
          <div className="wa-quick-list">
            {QUICK_MESSAGES.map(m => (
              <button key={m.label} className="wa-quick-btn" onClick={() => send(m.text, m.category)}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="wa-input-row">
            <input
              className="wa-input"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendCustom()}
              placeholder="Type your message..."
              aria-label="Custom WhatsApp message"
            />
            <button className="wa-send-btn" onClick={sendCustom} aria-label="Send">➤</button>
          </div>

          <div className="wa-panel-footer">Secured by WhatsApp · Karur Plywood &amp; Co.</div>
        </div>
      )}

      {/* Toggle button */}
      <button
        className={`wa-toggle-btn${open ? ' wa-toggle-btn--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close WhatsApp chat' : 'Chat with us on WhatsApp'}
      >
        {open
          ? <span style={{ color: 'white', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>✕</span>
          : <WAIcon size={26} />
        }
      </button>

      <style>{`
        /* ── PANEL ── */
        .wa-panel {
          position: fixed; bottom: 90px; right: 28px; z-index: 9998;
          width: 330px;
          background: #0d1f3a;
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 10px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7);
          animation: waSlideUp 0.25s ease;
          font-family: 'DM Sans', sans-serif;
        }
        @keyframes waSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .wa-panel-header {
          background: #25D366;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
        }
        .wa-panel-avatar {
          width: 40px; height: 40px; background: rgba(255,255,255,0.2);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 18px; flex-shrink: 0;
        }
        .wa-panel-info { flex: 1; }
        .wa-panel-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700; color: white; font-size: 13px; letter-spacing: 0.04em;
        }
        .wa-panel-status {
          font-size: 11px; color: rgba(255,255,255,0.85);
          display: flex; align-items: center; gap: 5px; margin-top: 2px;
        }
        .wa-online-dot {
          width: 6px; height: 6px; background: white;
          border-radius: 50%; display: inline-block;
        }
        .wa-panel-close {
          background: none; border: none; color: white;
          font-size: 16px; cursor: pointer; padding: 4px; line-height: 1;
          transition: opacity 0.15s;
        }
        .wa-panel-close:hover { opacity: 0.7; }

        /* Bubble */
        .wa-panel-body { padding: 16px 16px 8px; }
        .wa-bubble {
          background: rgba(11,36,71,0.7);
          border: 1px solid rgba(249,115,22,0.12);
          border-radius: 4px 12px 12px 12px;
          padding: 12px 14px;
          display: inline-block; max-width: 88%;
        }
        .wa-bubble-text { font-size: 13px; color: #A8BCCC; margin: 0; line-height: 1.65; }
        .wa-bubble-time { font-size: 10px; color: #7A8EA8; display: block; text-align: right; margin-top: 6px; }

        /* Quick message list */
        .wa-quick-list {
          padding: 8px 14px 12px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .wa-quick-btn {
          text-align: left;
          background: rgba(249,115,22,0.07);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 4px; padding: 8px 13px;
          font-size: 12px; color: #FF9A45;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-weight: 600; letter-spacing: 0.04em;
          transition: background 0.15s, border-color 0.15s;
        }
        .wa-quick-btn:hover {
          background: rgba(249,115,22,0.15);
          border-color: #F97316;
        }

        /* Input */
        .wa-input-row {
          padding: 0 12px 14px;
          display: flex; gap: 8px;
        }
        .wa-input {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; padding: 9px 12px;
          font-size: 13px; color: #F8F9FB;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .wa-input:focus { border-color: #F97316; }
        .wa-input::placeholder { color: #7A8EA8; }
        .wa-send-btn {
          width: 38px; height: 38px;
          background: #25D366; border: none; border-radius: 4px;
          font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.15s;
          color: white;
        }
        .wa-send-btn:hover { background: #1fbc59; }

        /* Footer note */
        .wa-panel-footer {
          background: rgba(7,15,31,0.5);
          border-top: 1px solid rgba(249,115,22,0.08);
          padding: 8px 14px;
          font-size: 10px; color: #7A8EA8; text-align: center;
        }

        /* ── TOGGLE BUTTON ── */
        .wa-toggle-btn {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          width: 54px; height: 54px;
          background: #25D366; border: none; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37,211,102,0.5);
          animation: waFloat 3s ease-in-out infinite;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .wa-toggle-btn:hover {
          animation: none;
          transform: scale(1.12);
          box-shadow: 0 6px 28px rgba(37,211,102,0.65);
        }
        .wa-toggle-btn--open {
          animation: none;
          background: #19376D;
          box-shadow: 0 4px 20px rgba(11,36,71,0.5);
        }
        @keyframes waFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }
      `}</style>
    </>
  );
}

'use client';
// src/app/admin/bom/BOMTab.tsx
// Drop this component into your admin dashboard as a new tab.
// Usage in dashboard/page.tsx: import BOMTab from '../bom/BOMTab'; then render <BOMTab />

import { useState, useEffect, useCallback, useRef } from 'react';

interface BOMRequest {
  id: number;
  name: string;
  phone: string;
  location: string;
  notes: string;
  image_url: string;
  status: 'pending' | 'quoted' | 'converted' | 'rejected';
  created_at: string;
  quoted_at: string | null;
  converted_at: string | null;
}

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

const STATUS_CONFIG = {
  pending:   { label: '⏳ Pending',   bg: 'rgba(249,115,22,0.12)',    color: '#F97316' },
  quoted:    { label: '💬 Quoted',    bg: 'rgba(59,130,246,0.12)',    color: '#93C5FD' },
  converted: { label: '✅ Converted', bg: 'rgba(37,211,102,0.12)',    color: '#4ADE80' },
  rejected:  { label: '✗ Rejected',  bg: 'rgba(248,113,113,0.10)',   color: '#FCA5A5' },
};

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('91') ? digits : '91' + digits;
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Detail modal ──────────────────────────────────────────────
function BOMModal({ bom, onClose, onStatusChange }: {
  bom: BOMRequest;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[bom.status];

  const updateStatus = async (status: string) => {
    setUpdating(true);
    const res = await fetch(`/api/bom/${bom.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onStatusChange(bom.id, status);
    setUpdating(false);
  };

  const sendQuoteOnWA = () => {
    const phone = formatPhone(bom.phone);
    const text = encodeURIComponent(
      `Hi ${bom.name}! 😊\n\nThank you for sending us your material list.\n\nHere is your quote:\n\n` +
      `[Type your quote here]\n\n` +
      `📦 Items will be delivered to: ${bom.location || 'your location'}\n\n` +
      `_Karur Plywood & Company, Karur_`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    if (bom.status === 'pending') updateStatus('quoted');
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#070F1F', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(249,115,22,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '.05em', color: '#F8F9FB' }}>
              BOM REQUEST #{bom.id}
            </div>
            <div style={{ fontSize: 12, color: '#7A8EA8', marginTop: 2 }}>{timeAgo(bom.created_at)}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 4, color: '#7A8EA8', padding: '5px 11px', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: 12 }}>✕</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Image */}
          <div style={{ padding: 20, borderRight: '1px solid rgba(249,115,22,0.1)' }}>
            <div style={{ fontSize: 11, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 12 }}>
              Material List Image
            </div>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(249,115,22,0.15)', background: '#0d1f3a', aspectRatio: '4/3' }}>
              <img
                src={bom.image_url}
                alt="BOM"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <a
              href={bom.image_url}
              target="_blank"
              rel="noopener"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, padding: '8px 0', borderRadius: 4, border: '1px solid rgba(249,115,22,0.2)', color: '#F97316', fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none', transition: 'background .2s' }}
            >
              🔍 Open Full Size ↗
            </a>
          </div>

          {/* Customer details */}
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 14 }}>
              Customer Details
            </div>

            {[
              { icon: '👤', label: 'Name',     value: bom.name },
              { icon: '📞', label: 'Phone',    value: bom.phone },
              { icon: '📍', label: 'Location', value: bom.location || '—' },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#7A8EA8', fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>{row.label}</div>
                <div style={{ fontSize: 15, color: '#F8F9FB', fontWeight: 500 }}>{row.icon} {row.value}</div>
              </div>
            ))}

            {bom.notes && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#7A8EA8', fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 13, color: '#A8BCCC', lineHeight: 1.65, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 6, padding: '10px 12px' }}>
                  "{bom.notes}"
                </div>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#7A8EA8', fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>Received</div>
              <div style={{ fontSize: 13, color: '#7A8EA8' }}>
                {new Date(bom.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {bom.quoted_at && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#7A8EA8', fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>Quoted At</div>
                <div style={{ fontSize: 13, color: '#93C5FD' }}>
                  {new Date(bom.quoted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(249,115,22,0.1)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Primary CTA */}
          <button
            onClick={sendQuoteOnWA}
            disabled={updating}
            style={{ width: '100%', padding: '14px 0', borderRadius: 4, background: '#25D366', border: 'none', color: 'white', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .2s' }}
          >
            💬 Send Quote on WhatsApp
          </button>

          {/* Status update buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {bom.status !== 'quoted' && (
              <button onClick={() => updateStatus('quoted')} disabled={updating}
                style={{ flex: 1, padding: '10px 0', borderRadius: 4, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.1)', color: '#93C5FD', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                💬 Mark Quoted
              </button>
            )}
            {bom.status !== 'converted' && (
              <button onClick={() => updateStatus('converted')} disabled={updating}
                style={{ flex: 1, padding: '10px 0', borderRadius: 4, border: '1px solid rgba(37,211,102,0.3)', background: 'rgba(37,211,102,0.1)', color: '#4ADE80', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                ✅ Mark Converted
              </button>
            )}
            {bom.status !== 'rejected' && (
              <button onClick={() => updateStatus('rejected')} disabled={updating}
                style={{ flex: 1, padding: '10px 0', borderRadius: 4, border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.06)', color: '#FCA5A5', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                ✗ Reject
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main BOM tab ──────────────────────────────────────────────
export default function BOMTab() {
  const [boms,         setBoms]         = useState<BOMRequest[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected,     setSelected]     = useState<BOMRequest | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [msg,          setMsg]          = useState<{ text: string; ok: boolean } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const fetchBOMs = useCallback(async (filter = statusFilter) => {
    const res  = await fetch(`/api/bom?status=${filter}`);
    const data = await res.json();
    if (Array.isArray(data)) setBoms(data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchBOMs(); }, [fetchBOMs]);

  // ── Push notification polling ────────────────────────────
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      showMsg('Your browser does not support notifications.', false);
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      showMsg('Notifications blocked. Allow them in browser settings.', false);
      return;
    }
    setNotifEnabled(true);
    showMsg('🔔 Notifications enabled! You\'ll be alerted for new BOMs.');
  };

  useEffect(() => {
    if (!notifEnabled) return;

    const poll = async () => {
      try {
        const res  = await fetch('/api/bom?new=1');
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;

        data.forEach((bom: any) => {
          const n = new Notification(`📋 New BOM from ${bom.name}`, {
            body: `Phone: ${bom.phone} — Click to view`,
            icon: '/favicon.ico',
            tag:  `bom-${bom.id}`,
          });
          n.onclick = () => {
            window.focus();
            fetchBOMs(); // refresh list so new item appears
          };
        });

        fetchBOMs(); // refresh list
      } catch {
        // silent — polling runs in background
      }
    };

    pollRef.current = setInterval(poll, 10_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [notifEnabled, fetchBOMs]);

  const handleStatusChange = (id: number, status: string) => {
    setBoms(prev => prev.map(b => b.id === id ? { ...b, status: status as BOMRequest['status'] } : b));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as BOMRequest['status'] } : prev);
    showMsg(status === 'converted' ? '✅ Marked as converted!' : status === 'quoted' ? '💬 Marked as quoted!' : 'Status updated.');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this BOM request? The image will also be removed.')) return;
    const res = await fetch(`/api/bom/${id}`, { method: 'DELETE' });
    if (res.ok) { setBoms(prev => prev.filter(b => b.id !== id)); showMsg('Deleted.'); }
    else showMsg('Error deleting.', false);
  };

  const filtered = statusFilter === 'all' ? boms : boms.filter(b => b.status === statusFilter);

  const stats = {
    total:     boms.length,
    pending:   boms.filter(b => b.status === 'pending').length,
    quoted:    boms.filter(b => b.status === 'quoted').length,
    converted: boms.filter(b => b.status === 'converted').length,
  };

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total BOMs',  value: stats.total,     color: '#F97316' },
          { label: 'Pending',     value: stats.pending,   color: '#F97316' },
          { label: 'Quoted',      value: stats.quoted,    color: '#93C5FD' },
          { label: 'Converted',   value: stats.converted, color: '#4ADE80' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(25,55,109,0.35)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 8, padding: '16px 18px' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', letterSpacing: '.04em', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#7A8EA8', marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'pending', 'quoted', 'converted', 'rejected'] as const).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); fetchBOMs(s); }}
              style={{ padding: '6px 14px', borderRadius: 3, border: '1px solid', fontSize: 11, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s',
                borderColor: statusFilter === s ? '#F97316' : 'rgba(255,255,255,0.1)',
                background: statusFilter === s ? 'rgba(249,115,22,0.12)' : 'transparent',
                color: statusFilter === s ? '#F97316' : '#7A8EA8',
              }}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && (
            <div style={{ fontSize: 12, padding: '5px 12px', borderRadius: 4, fontWeight: 600, background: msg.ok ? 'rgba(37,211,102,0.1)' : 'rgba(249,115,22,0.1)', color: msg.ok ? '#4ADE80' : '#F97316', border: `1px solid ${msg.ok ? 'rgba(37,211,102,0.2)' : 'rgba(249,115,22,0.2)'}` }}>
              {msg.text}
            </div>
          )}
          {!notifEnabled ? (
            <button onClick={enableNotifications}
              style={{ padding: '7px 14px', borderRadius: 3, border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)', color: '#F97316', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              🔔 Enable Notifications
            </button>
          ) : (
            <div style={{ fontSize: 12, color: '#4ADE80', fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '.08em' }}>
              🔔 Notifications ON
            </div>
          )}
          <button onClick={() => fetchBOMs()}
            style={{ padding: '7px 14px', borderRadius: 3, border: '1px solid rgba(249,115,22,0.2)', background: 'transparent', color: '#7A8EA8', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* BOM list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7A8EA8' }}>⏳ Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '.05em', color: '#F8F9FB', marginBottom: 6 }}>
            {statusFilter === 'all' ? 'NO BOM REQUESTS YET' : `NO ${statusFilter.toUpperCase()} REQUESTS`}
          </div>
          <p style={{ color: '#7A8EA8', fontSize: 13 }}>
            {statusFilter === 'all' ? 'When customers submit material lists, they\'ll appear here.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(bom => {
            const cfg = STATUS_CONFIG[bom.status];
            return (
              <div key={bom.id}
                style={{ background: 'rgba(25,55,109,0.35)', border: `1px solid ${bom.status === 'pending' ? 'rgba(249,115,22,0.3)' : 'rgba(249,115,22,0.12)'}`, borderRadius: 8, padding: '16px 18px', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 16, alignItems: 'center', transition: 'border-color .2s' }}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setSelected(bom)}
                  style={{ width: 60, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(249,115,22,0.2)', cursor: 'pointer', flexShrink: 0, background: '#0d1f3a' }}
                >
                  <img src={bom.image_url} alt="BOM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#F8F9FB' }}>{bom.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {bom.status === 'pending' && (
                      <span style={{ fontSize: 10, color: '#F97316', fontFamily: "'Syne', sans-serif", fontWeight: 700, animation: 'bomPulse 1.5s ease infinite' }}>● NEW</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#7A8EA8' }}>
                    <span>📞 {bom.phone}</span>
                    {bom.location && <span>📍 {bom.location}</span>}
                    <span>🕐 {timeAgo(bom.created_at)}</span>
                  </div>
                  {bom.notes && (
                    <div style={{ fontSize: 12, color: '#7A8EA8', marginTop: 4, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
                      "{bom.notes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 130 }}>
                  <button
                    onClick={() => setSelected(bom)}
                    style={{ padding: '8px 0', borderRadius: 3, border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)', color: '#F97316', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    👁 View Details
                  </button>
                  <button
                    onClick={() => {
                      const phone = formatPhone(bom.phone);
                      const text  = encodeURIComponent(`Hi ${bom.name}! We received your material list. Here's your quote:\n\n[Type quote here]\n\n_Karur Plywood & Company_`);
                      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                      if (bom.status === 'pending') {
                        fetch(`/api/bom/${bom.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'quoted' }) })
                          .then(() => handleStatusChange(bom.id, 'quoted'));
                      }
                    }}
                    style={{ padding: '8px 0', borderRadius: 3, background: '#25D366', border: 'none', color: 'white', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    💬 Send Quote
                  </button>
                  <button
                    onClick={() => handleDelete(bom.id)}
                    style={{ padding: '6px 0', borderRadius: 3, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', color: '#FCA5A5', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <BOMModal
          bom={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <style>{`
        @keyframes bomPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>
    </div>
  );
}

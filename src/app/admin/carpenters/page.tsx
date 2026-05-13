'use client';
// src/app/admin/carpenters/page.tsx
// Added: inline edit form so admin can update any carpenter's profile after listing
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Carpenter {
  id: string; name: string; phone: string; area: string;
  speciality: string[]; experience: number; bio: string;
  photo_url: string; wa_number: string; verified: boolean;
  rating: number; review_count: number; created_at: string;
}

const AREAS = ['Karur', 'Trichy', 'Namakkal', 'Erode', 'Salem', 'Dindigul'];

const inp: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(249,115,22,0.2)',
  borderRadius: 4,
  padding: '9px 12px',
  color: '#F8F9FB',
  fontFamily: "'DM Sans',sans-serif",
  fontSize: 13,
  outline: 'none',
};
const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontFamily: "'Syne',sans-serif",
  fontWeight: 700,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: '#7A8EA8',
  marginBottom: 5,
};

export default function AdminCarpentersPage() {
  const router = useRouter();
  const [carpenters, setCarpenters]   = useState<Carpenter[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<'all' | 'pending' | 'verified'>('all');
  const [msg, setMsg]                 = useState<{ text: string; ok: boolean } | null>(null);

  // ── Edit state ─────────────────────────────────────────────
  const [editId, setEditId]           = useState<string | null>(null);
  const [editForm, setEditForm]       = useState<Partial<Carpenter> & { specialityRaw?: string }>({});
  const [saving, setSaving]           = useState(false);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/carpenters?all=1');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setCarpenters(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Open edit form pre-filled ─────────────────────────────
  const openEdit = (c: Carpenter) => {
    setEditId(c.id);
    setEditForm({
      name:         c.name,
      phone:        c.phone,
      wa_number:    c.wa_number || '',
      area:         c.area,
      experience:   c.experience,
      bio:          c.bio || '',
      photo_url:    c.photo_url || '',
      rating:       c.rating,
      specialityRaw: (c.speciality || []).join(', '),
    });
  };

  const closeEdit = () => { setEditId(null); setEditForm({}); };

  const setF = (k: string, v: any) => setEditForm(f => ({ ...f, [k]: v }));

  // ── Save edits ─────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editId) return;
    if (!editForm.name?.trim()) { showMsg('Name is required.', false); return; }

    setSaving(true);
    const payload = {
      name:       editForm.name?.trim(),
      phone:      editForm.phone?.trim(),
      wa_number:  editForm.wa_number?.trim() || '',
      area:       editForm.area,
      experience: Number(editForm.experience) || 1,
      bio:        editForm.bio?.trim() || '',
      photo_url:  editForm.photo_url?.trim() || '',
      rating:     Number(editForm.rating) || 0,
      speciality: (editForm.specialityRaw || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
    };

    const res = await fetch(`/api/carpenters/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showMsg('✅ Carpenter profile updated!');
      // Update local state immediately — no refetch needed
      setCarpenters(prev =>
        prev.map(c =>
          c.id === editId
            ? { ...c, ...payload, id: c.id, verified: c.verified, review_count: c.review_count, created_at: c.created_at }
            : c
        )
      );
      closeEdit();
    } else {
      const d = await res.json();
      showMsg(d.error || 'Error saving.', false);
    }
    setSaving(false);
  };

  // ── Verify / unlist toggle ─────────────────────────────────
  const toggle = async (id: string, verified: boolean) => {
    const res = await fetch(`/api/carpenters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: !verified }),
    });
    if (res.ok) {
      showMsg(verified ? 'Carpenter unlisted.' : '✅ Verified & listed!');
      setCarpenters(c => c.map(x => x.id === id ? { ...x, verified: !x.verified } : x));
    } else showMsg('Error updating.', false);
  };

  // ── Delete ─────────────────────────────────────────────────
  const del = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} from directory?`)) return;
    const res = await fetch(`/api/carpenters/${id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('Deleted.'); setCarpenters(c => c.filter(x => x.id !== id)); }
    else showMsg('Error deleting.', false);
  };

  const filtered = carpenters.filter(c =>
    filter === 'all' ? true : filter === 'pending' ? !c.verified : c.verified
  );

  // ── Shared button style ────────────────────────────────────
  const actionBtn = (label: string, onClick: () => void, color: string, bg: string) => (
    <button
      onClick={onClick}
      style={{
        padding: '7px 12px', borderRadius: 3, border: `1px solid ${color}40`,
        background: bg, color, fontFamily: "'Syne',sans-serif", fontWeight: 700,
        fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
        transition: 'opacity 0.15s', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#070F1F', color: '#F8F9FB', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: 'rgba(11,36,71,0.8)', borderBottom: '1px solid rgba(249,115,22,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.push('/admin/dashboard')}
            style={{ background: 'none', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 4, color: '#7A8EA8', padding: '6px 12px', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            ← Dashboard
          </button>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '.06em', color: '#F8F9FB' }}>
            🔨 Carpenter Directory
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {msg && (
            <div style={{ fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 4,
              background: msg.ok ? 'rgba(37,211,102,0.1)' : 'rgba(249,115,22,0.1)',
              color: msg.ok ? '#4ADE80' : '#F97316',
              border: `1px solid ${msg.ok ? 'rgba(37,211,102,0.2)' : 'rgba(249,115,22,0.2)'}`,
            }}>{msg.text}</div>
          )}
          <button onClick={fetchAll}
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 4, color: '#F97316', padding: '6px 14px', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Applications', val: carpenters.length, color: '#F97316' },
            { label: 'Verified & Listed',   val: carpenters.filter(c => c.verified).length, color: '#4ADE80' },
            { label: 'Pending Verification',val: carpenters.filter(c => !c.verified).length, color: '#FDE047' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(25,55,109,0.35)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 8, padding: '18px 20px' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.5rem', letterSpacing: '.04em', color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#7A8EA8', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['all', 'pending', 'verified'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: 3, border: '1px solid',
                borderColor: filter === f ? '#F97316' : 'rgba(255,255,255,0.12)',
                background:  filter === f ? 'rgba(249,115,22,0.12)' : 'transparent',
                color:       filter === f ? '#F97316' : '#7A8EA8',
                fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11,
                letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}>
              {f === 'all' ? 'All' : f === 'pending' ? '⏳ Pending' : '✅ Verified'}
            </button>
          ))}
        </div>

        {/* Carpenter list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#7A8EA8' }}>⏳ Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#7A8EA8' }}>No carpenters in this filter.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(c => (
              <div key={c.id}>
                {/* Card */}
                <div style={{
                  background: 'rgba(25,55,109,0.35)',
                  border: `1px solid ${c.id === editId ? '#F97316' : c.verified ? 'rgba(37,211,102,0.2)' : 'rgba(249,115,22,0.15)'}`,
                  borderRadius: editId === c.id ? '8px 8px 0 0' : 8,
                  padding: '18px 20px',
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#F8F9FB' }}>{c.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 2,
                        fontFamily: "'Syne',sans-serif", letterSpacing: '.12em', textTransform: 'uppercase',
                        background: c.verified ? 'rgba(37,211,102,0.12)' : 'rgba(249,115,22,0.1)',
                        color: c.verified ? '#4ADE80' : '#F97316',
                      }}>
                        {c.verified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#7A8EA8', flexWrap: 'wrap', marginBottom: c.bio ? 8 : 0 }}>
                      <span>📞 {c.phone}</span>
                      <span>📍 {c.area}</span>
                      <span>🔨 {c.experience} yrs</span>
                      {c.rating > 0 && <span>⭐ {c.rating}</span>}
                      <span style={{ fontSize: 11 }}>
                        Applied: {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {c.bio && <div style={{ fontSize: 12, color: '#7A8EA8', lineHeight: 1.65, maxWidth: 560 }}>{c.bio}</div>}
                    {c.speciality?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                        {c.speciality.map(s => (
                          <span key={s} style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316', padding: '2px 7px', borderRadius: 2 }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 130 }}>
                    <a
                      href={`https://wa.me/${(c.wa_number || c.phone).replace(/\D/g,'')}?text=Hi+${encodeURIComponent(c.name)}%2C+this+is+Karur+Plywood.+Regarding+your+carpenter+directory+listing...`}
                      target="_blank" rel="noopener"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 3, background: '#25D366', color: 'white', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                      💬 WhatsApp
                    </a>

                    {/* Edit button — toggles the edit form below */}
                    {actionBtn(
                      editId === c.id ? '✕ Cancel' : '✏️ Edit Profile',
                      () => editId === c.id ? closeEdit() : openEdit(c),
                      '#F97316', 'rgba(249,115,22,0.1)'
                    )}

                    {actionBtn(
                      c.verified ? '⏸ Unlist' : '✓ Verify & List',
                      () => toggle(c.id, c.verified),
                      c.verified ? '#F97316' : '#4ADE80',
                      c.verified ? 'rgba(249,115,22,0.1)' : 'rgba(37,211,102,0.15)'
                    )}

                    {actionBtn('🗑️ Delete', () => del(c.id, c.name), '#F87171', 'rgba(248,113,113,0.08)')}
                  </div>
                </div>

                {/* ── INLINE EDIT FORM ── appears below the card when editing */}
                {editId === c.id && (
                  <div style={{
                    background: 'rgba(11,36,71,0.6)',
                    border: '1px solid #F97316',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    padding: '24px 20px',
                  }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#F97316', marginBottom: 18 }}>
                      ✏️ Editing: {c.name}
                    </div>

                    {/* Row 1: Name + Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={lbl}>Full Name *</label>
                        <input style={inp} value={editForm.name || ''} onChange={e => setF('name', e.target.value)} placeholder="Full name" />
                      </div>
                      <div>
                        <label style={lbl}>Phone *</label>
                        <input style={inp} value={editForm.phone || ''} onChange={e => setF('phone', e.target.value)} placeholder="+91 98765 43210" />
                      </div>
                    </div>

                    {/* Row 2: WhatsApp + Area */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={lbl}>WhatsApp Number</label>
                        <input style={inp} value={editForm.wa_number || ''} onChange={e => setF('wa_number', e.target.value)} placeholder="919876543210" />
                      </div>
                      <div>
                        <label style={lbl}>Area / City</label>
                        <select style={{ ...inp, cursor: 'pointer' }} value={editForm.area || 'Karur'} onChange={e => setF('area', e.target.value)}>
                          {AREAS.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Experience + Rating */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={lbl}>Years Experience</label>
                        <input style={inp} type="number" min="1" value={editForm.experience || 1} onChange={e => setF('experience', e.target.value)} />
                      </div>
                      <div>
                        <label style={lbl}>Rating (1–5)</label>
                        <input style={inp} type="number" min="0" max="5" step="0.1" value={editForm.rating || 0} onChange={e => setF('rating', e.target.value)} />
                      </div>
                    </div>

                    {/* Specialities */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={lbl}>Specialities (comma separated)</label>
                      <input style={inp} value={editForm.specialityRaw || ''} onChange={e => setF('specialityRaw', e.target.value)} placeholder="wardrobes, kitchen cabinets, doors, furniture" />
                    </div>

                    {/* Profile photo URL */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={lbl}>Profile Photo URL</label>
                      <input style={inp} value={editForm.photo_url || ''} onChange={e => setF('photo_url', e.target.value)} placeholder="https://..." />
                    </div>

                    {/* Bio */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={lbl}>Bio / Description</label>
                      <textarea
                        style={{ ...inp, resize: 'none' } as React.CSSProperties}
                        rows={3}
                        value={editForm.bio || ''}
                        onChange={e => setF('bio', e.target.value)}
                        placeholder="Short bio about the carpenter's experience and speciality..."
                      />
                    </div>

                    {/* Save / Cancel */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 4, background: saving ? 'rgba(249,115,22,0.4)' : '#F97316', color: '#0B2447', border: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: saving ? 'default' : 'pointer' }}>
                        {saving ? '⏳ Saving...' : '✓ Save Changes'}
                      </button>
                      <button
                        onClick={closeEdit}
                        style={{ padding: '10px 20px', borderRadius: 4, background: 'transparent', border: '1px solid rgba(249,115,22,0.2)', color: '#7A8EA8', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        input:focus, select:focus, textarea:focus { border-color: #F97316 !important; }
        select option { background: #0d1f3a; }
      `}</style>
    </div>
  );
}

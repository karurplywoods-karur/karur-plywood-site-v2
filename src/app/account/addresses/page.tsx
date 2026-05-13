'use client';
// src/app/account/addresses/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

interface Address {
  id: string; label: string; full_name: string; phone: string;
  line1: string; line2: string; city: string; state: string;
  pincode: string; is_default: boolean;
}
const EMPTY = { label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: 'Tamil Nadu', pincode: '' };

export default function AddressesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Address | null>(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [msg,       setMsg]       = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return; }
      loadAddresses();
    });
  }, []);

  const loadAddresses = () => {
    fetch('/api/addresses').then(r => r.json()).then(data => {
      setAddresses(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); setError(''); };
  const openEdit = (a: Address) => {
    setForm({ label: a.label, full_name: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode });
    setEditing(a); setShowForm(true); setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.line1 || !form.city || !form.pincode) {
      setError('Please fill all required fields.'); return;
    }
    setSaving(true); setError('');
    const url    = editing ? `/api/addresses/${editing.id}` : '/api/addresses';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    setShowForm(false); setEditing(null);
    setMsg(editing ? 'Address updated.' : 'Address added.'); setTimeout(() => setMsg(''), 3000);
    loadAddresses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
    setAddresses(prev => prev.filter(a => a.id !== id));
    setMsg('Address deleted.'); setTimeout(() => setMsg(''), 3000);
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/addresses/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_default: true }) });
    loadAddresses();
  };

  const inp = { width: '100%', background: 'rgba(7,15,31,0.6)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '6px', padding: '10px 13px', fontSize: '14px', color: '#F8F9FB', fontFamily: "'DM Sans',sans-serif", outline: 'none' } as React.CSSProperties;
  const lbl = { display: 'block', fontFamily: "'Syne',sans-serif", fontSize: '.6rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: '5px' } as React.CSSProperties;

  return (
    <div style={{ minHeight: '100vh', background: '#070F1F', padding: '80px 0 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 48px' }} className="addr-pg-pad">

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, fontSize: 12, color: '#7A8EA8', fontFamily: "'Syne',sans-serif" }}>
          <Link href="/account" style={{ color: '#7A8EA8', textDecoration: 'none' }}>← My Account</Link>
          <span>›</span>
          <span style={{ color: '#F8F9FB', fontWeight: 700 }}>Addresses</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', letterSpacing: '.05em', color: '#F8F9FB' }}>
            DELIVERY ADDRESSES
          </h1>
          {!showForm && (
            <button onClick={openNew}
              style={{ padding: '9px 18px', background: '#F97316', color: '#0B2447', border: 'none', borderRadius: 6, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              + Add Address
            </button>
          )}
        </div>

        {msg && (
          <div style={{ padding: '10px 14px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 6, color: '#4ADE80', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{ background: 'rgba(25,55,109,0.25)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: 24, marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.7rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#F97316', marginBottom: 18 }}>
              {editing ? 'Edit Address' : 'New Address'}
            </div>
            {error && <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6, color: '#FCA5A5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Label</label>
                  <select style={inp} value={form.label} onChange={e => set('label', e.target.value)}>
                    {['Home', 'Office', 'Site', 'Other'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Full Name *</label>
                  <input style={inp} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Rajan Kumar" />
                </div>
              </div>
              <div>
                <label style={lbl}>Phone *</label>
                <input style={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={lbl}>Door No., Street *</label>
                <input style={inp} value={form.line1} onChange={e => set('line1', e.target.value)} placeholder="12A, Main Road" />
              </div>
              <div>
                <label style={lbl}>Area / Landmark</label>
                <input style={inp} value={form.line2} onChange={e => set('line2', e.target.value)} placeholder="Near Bus Stand" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>City *</label>
                  <input style={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Karur" />
                </div>
                <div>
                  <label style={lbl}>State</label>
                  <input style={inp} value={form.state} onChange={e => set('state', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Pincode *</label>
                  <input style={inp} value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="639001" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '12px 0', background: '#F97316', color: '#0B2447', border: 'none', borderRadius: 6, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.78rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                  {saving ? '⏳ Saving...' : editing ? '✓ Update Address' : '✓ Save Address'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                  style={{ padding: '12px 20px', background: 'transparent', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 6, color: '#7A8EA8', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.72rem', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#7A8EA8' }}>⏳ Loading...</div>
        ) : addresses.length === 0 && !showForm ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
            <div style={{ color: '#7A8EA8', fontSize: 14, marginBottom: 16 }}>No saved addresses yet.</div>
            <button onClick={openNew}
              style={{ padding: '10px 22px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 6, color: '#F97316', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              + Add Your First Address
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{ background: 'rgba(25,55,109,0.2)', border: `1px solid ${addr.is_default ? 'rgba(249,115,22,0.35)' : 'rgba(249,115,22,0.1)'}`, borderRadius: 10, padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', background: 'rgba(249,115,22,0.1)', color: '#F97316', border: '1px solid rgba(249,115,22,0.2)', padding: '2px 8px', borderRadius: 2 }}>{addr.label}</span>
                    {addr.is_default && <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', background: 'rgba(37,211,102,0.1)', color: '#4ADE80', border: '1px solid rgba(37,211,102,0.2)', padding: '2px 8px', borderRadius: 2 }}>Default</span>}
                  </div>
                  <div style={{ fontWeight: 700, color: '#F8F9FB', fontSize: 14, marginBottom: 4 }}>{addr.full_name}</div>
                  <div style={{ fontSize: 13, color: '#A8BCCC', lineHeight: 1.7 }}>
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                    {addr.city}, {addr.state} — {addr.pincode}<br />
                    📞 {addr.phone}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => openEdit(addr)}
                    style={{ padding: '7px 14px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 4, color: '#F97316', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '11px', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    ✏️ Edit
                  </button>
                  {!addr.is_default && (
                    <button onClick={() => setDefault(addr.id)}
                      style={{ padding: '7px 14px', background: 'transparent', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 4, color: '#4ADE80', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '11px', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                      Set Default
                    </button>
                  )}
                  <button onClick={() => handleDelete(addr.id)}
                    style={{ padding: '7px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 4, color: '#F87171', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '11px', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .addr-pg-pad { padding:32px 48px; }
        select option { background: #0d1f3a; }
        input:focus, select:focus { border-color: #F97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1) !important; }
        @media(max-width:640px){ .addr-pg-pad { padding:20px !important; } }
      `}</style>
    </div>
  );
}

'use client';
// src/app/account/addresses/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';
import AccountSidebar from '@/components/account/AccountSidebar';

interface Address {
  id: string; label: string; full_name: string; phone: string;
  line1: string; line2: string; city: string; state: string;
  pincode: string; google_map_link: string; latitude: number | null;
  longitude: number | null; is_default: boolean;
}
const EMPTY = {
  label: 'Home', full_name: '', phone: '', line1: '', line2: '',
  city: '', state: 'Tamil Nadu', pincode: '', google_map_link: '',
  latitude: null as number | null, longitude: null as number | null,
};
const LABEL_ICON: Record<string, string> = { Home: '🏠', Office: '🏢', Site: '🏗️', Other: '📍' };

export default function AddressesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [customer,  setCustomer]  = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [recent,    setRecent]    = useState<any[]>([]);
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
      if (!session) { router.push('/auth/login?next=/account/addresses'); return; }
      Promise.all([
        fetch('/api/customer').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
      ]).then(([c, o]) => {
        setCustomer(c);
        setRecent(Array.isArray(o) ? o.filter((x: any) => x.status === 'delivered').slice(0, 4) : []);
      });
      loadAddresses();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAddresses = () => {
    fetch('/api/addresses').then(r => r.json()).then(data => {
      setAddresses(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); setError(''); };
  const openEdit = (a: Address) => {
    setForm({
      label: a.label, full_name: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2,
      city: a.city, state: a.state, pincode: a.pincode, google_map_link: a.google_map_link || '',
      latitude: a.latitude ?? null, longitude: a.longitude ?? null,
    });
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="addr-pad">

        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <Link href="/account" style={{ color: '#9CA3AF', textDecoration: 'none' }}>My Account</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>Saved Addresses</span>
        </div>

        <div className="addr-layout">
          <AccountSidebar customer={customer} active="addresses" />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.4rem,2.6vw,1.8rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 4px' }}>Saved Addresses</h1>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Manage your delivery addresses</p>
              </div>
              {!showForm && (
                <button onClick={openNew} className="addr-add-btn">+ Add New Address</button>
              )}
            </div>

            {msg && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, color: '#16a34a', fontSize: 13, marginBottom: 16 }}>{msg}</div>}

            {/* Form */}
            {showForm && (
              <div className="addr-card" style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.75rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F07316', marginBottom: 18 }}>
                  {editing ? 'Edit Address' : 'New Address'}
                </div>
                {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label className="addr-lbl">Label</label>
                      <select className="addr-inp" value={form.label} onChange={e => set('label', e.target.value)}>
                        {['Home', 'Office', 'Site', 'Other'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="addr-lbl">Full Name *</label>
                      <input className="addr-inp" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Rajan Kumar" />
                    </div>
                  </div>
                  <div>
                    <label className="addr-lbl">Phone *</label>
                    <input className="addr-inp" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="addr-lbl">Door No., Street *</label>
                    <input className="addr-inp" value={form.line1} onChange={e => set('line1', e.target.value)} placeholder="12A, Main Road" />
                  </div>
                  <div>
                    <label className="addr-lbl">Area / Landmark</label>
                    <input className="addr-inp" value={form.line2} onChange={e => set('line2', e.target.value)} placeholder="Near Bus Stand" />
                  </div>
                  <div>
                    <label className="addr-lbl">Google Map Link</label>
                    <input className="addr-inp" value={form.google_map_link} onChange={e => set('google_map_link', e.target.value)} placeholder="https://www.google.com/maps?q=..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <div><label className="addr-lbl">City *</label><input className="addr-inp" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Karur" /></div>
                    <div><label className="addr-lbl">State</label><input className="addr-inp" value={form.state} onChange={e => set('state', e.target.value)} /></div>
                    <div><label className="addr-lbl">Pincode *</label><input className="addr-inp" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="639001" /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="submit" disabled={saving} className="addr-save-btn">{saving ? '⏳ Saving...' : editing ? '✓ Update Address' : '✓ Save Address'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="addr-cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>⏳ Loading...</div>
            ) : addresses.length === 0 && !showForm ? (
              <div className="addr-card" style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
                <div style={{ color: '#6B7280', fontSize: 14, marginBottom: 16 }}>No saved addresses yet.</div>
                <button onClick={openNew} className="addr-add-btn">+ Add Your First Address</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addresses.map(addr => (
                  <div key={addr.id} className={`addr-card addr-row${addr.is_default ? ' addr-row--default' : ''}`}>
                    <div style={{ fontSize: 30 }}>{LABEL_ICON[addr.label] || '📍'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447' }}>{addr.label}</span>
                        {addr.is_default && <span className="addr-badge addr-badge--default">Default</span>}
                      </div>
                      <div style={{ fontWeight: 700, color: '#0B2447', fontSize: 13.5, marginBottom: 3 }}>{addr.full_name}</div>
                      <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                        {addr.google_map_link && (<><a href={addr.google_map_link} target="_blank" rel="noopener" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 700 }}>View Map Location</a><br /></>)}
                        {addr.city}, {addr.state} — {addr.pincode}<br />📞 {addr.phone}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button onClick={() => openEdit(addr)} className="addr-action-btn">✏️ Edit</button>
                      {!addr.is_default && <button onClick={() => setDefault(addr.id)} className="addr-action-btn addr-action-btn--green">Set Default</button>}
                      <button onClick={() => handleDelete(addr.id)} className="addr-action-btn addr-action-btn--red">🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside>
            <div className="addr-info-card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>📍</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 4 }}>Deliver to the right place</div>
              <div style={{ fontSize: 12.5, color: '#4B5563' }}>Add multiple addresses and choose the right one during checkout.</div>
            </div>

            <div className="addr-card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', marginBottom: 12 }}>Address Tips</div>
              {['Set a default address for faster checkout', 'Add Work / Site / Warehouse addresses', 'You can edit or delete anytime'].map(t => (
                <div key={t} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#4B5563', marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>{t}
                </div>
              ))}
            </div>

            {recent.length > 0 && (
              <div className="addr-card">
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', marginBottom: 12 }}>Recent Deliveries</div>
                {recent.map(o => (
                  <Link key={o.id} href={`/account/orders/${o.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid #F1EEE9', textDecoration: 'none' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0B2447' }}>{o.order_number}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>Delivered to {o.delivery_name?.split(' ')[0] || 'you'} · {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                    </div>
                    <span className="addr-badge" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Delivered</span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        .addr-layout { display: grid; grid-template-columns: 240px 1fr 260px; gap: 24px; align-items: start; }
        .addr-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .addr-row { display: flex; gap: 16px; align-items: flex-start; }
        .addr-row--default { border-color: rgba(240,115,22,0.4); background: #FFF9F4; }
        .addr-badge { font-family: 'Syne',sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 2px 9px; border-radius: 12px; }
        .addr-badge--default { background: #FFF4ED; color: #F07316; border: 1px solid rgba(240,115,22,0.3); }
        .addr-action-btn { padding: 7px 14px; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 6px; color: #0B2447; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 11px; cursor: pointer; letter-spacing: .04em; white-space: nowrap; }
        .addr-action-btn:hover { border-color: #F07316; color: #F07316; }
        .addr-action-btn--green { color: #16a34a; border-color: #bbf7d0; }
        .addr-action-btn--red { color: #dc2626; border-color: #fecaca; }
        .addr-add-btn { padding: 10px 18px; background: #F07316; color: #FFFFFF; border: none; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; white-space: nowrap; }
        .addr-lbl { display: block; font-family: 'Syne',sans-serif; font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #6B7280; margin-bottom: 5px; }
        .addr-inp { width: 100%; background: #FAF8F5; border: 1px solid #E5E1DC; border-radius: 6px; padding: 10px 13px; font-size: 14px; color: #0B2447; outline: none; box-sizing: border-box; }
        .addr-inp:focus { border-color: #F07316; background: #FFFFFF; }
        .addr-save-btn { flex: 1; padding: 12px 0; background: #F07316; color: #FFFFFF; border: none; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: .78rem; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; }
        .addr-cancel-btn { padding: 12px 20px; background: transparent; border: 1px solid #E5E1DC; border-radius: 6px; color: #6B7280; font-family: 'Syne',sans-serif; font-weight: 700; font-size: .72rem; cursor: pointer; }
        .addr-info-card { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 18px; }
        @media(max-width:1150px){ .addr-layout { grid-template-columns: 200px 1fr; } .addr-layout > aside { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; } }
        @media(max-width:768px){ .addr-layout { grid-template-columns: 1fr; } .addr-layout > aside { grid-template-columns: 1fr; } .addr-layout > :first-child { display: none; } .addr-row { flex-direction: column; } }
        @media(max-width:640px){ .addr-pad { padding-left: 16px !important; padding-right: 16px !important; } }
      `}</style>
    </div>
  );
}

'use client';
// src/components/EnquiryForm.tsx
import { useState } from 'react';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

const PRODUCTS = [
  'Plywood (BWR / MR / Commercial)',
  'Doors (Flush / Moulded / PVC)',
  'Laminates & Decorative Sheets',
  'Hardware Fittings',
  'Multiple Products',
];

interface Props { compact?: boolean; }

export default function EnquiryForm({ compact }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', location: '', product: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setDone(true);
      // Open WhatsApp with pre-filled message
      const text = `Hi, my name is ${form.name}. Phone: ${form.phone}. ${form.location ? `Location: ${form.location}. ` : ''}${form.product ? `Interested in: ${form.product}. ` : ''}${form.message}`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#0E0B08',
    border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8,
    padding: '11px 14px', fontSize: 14, color: '#F0E8DC',
    fontFamily: 'Outfit, sans-serif', outline: 'none',
    marginBottom: 0,
  };
  const label: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: compact ? '24px 0' : '40px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#F0E8DC', marginBottom: 8 }}>
        Enquiry Received!
      </div>
      <p style={{ color: '#9A8070', fontSize: 14, marginBottom: 20 }}>
        WhatsApp has opened with your message. We'll reply within minutes.
      </p>
      <button onClick={() => { setDone(false); setForm({ name:'',phone:'',location:'',product:'',message:'' }); }}
        style={{ background: 'none', border: '1px solid rgba(200,136,74,0.3)', borderRadius: 8, color: '#E0A86A', padding: '10px 20px', cursor: 'pointer', fontSize: 13 }}>
        Submit Another
      </button>
    </div>
  );

  return (
    <div>
      {!compact && (
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: '#F0E8DC', marginBottom: 24 }}>
          Send an Enquiry
        </div>
      )}

      {/* WA quick button */}
      <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+help+with+a+product+enquiry.`} target="_blank" rel="noopener"
        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg,#0D2B17,#091810)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, textDecoration: 'none' }}>
        <span style={{ fontSize: 28 }}>💬</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#F0E8DC' }}>Fastest: Chat on WhatsApp</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Get a reply in minutes</div>
        </div>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(200,136,74,0.15)' }} />
        <span style={{ fontSize: 12, color: '#9A8070' }}>or fill the form below</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(200,136,74,0.15)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={label}>Your Name *</label>
          <input style={inp} placeholder="e.g. Rajan Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label style={label}>Phone Number *</label>
          <input style={inp} placeholder="+91 99999 99999" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={label}>Your City / Location</label>
          <input style={inp} placeholder="e.g. Karur, Trichy" value={form.location} onChange={e => set('location', e.target.value)} />
        </div>
        <div>
          <label style={label}>Product Interested In</label>
          <select style={{ ...inp }} value={form.product} onChange={e => set('product', e.target.value)}>
            <option value="">Select category</option>
            {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={label}>Your Requirements</label>
        <textarea style={{ ...inp, resize: 'none' }} rows={3}
          placeholder="e.g. I need 20 sheets of 18mm BWR plywood for my kitchen renovation..."
          value={form.message} onChange={e => set('message', e.target.value)} />
      </div>

      {error && <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: '100%', background: loading ? '#1a5c2e' : '#25D366', color: 'white', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit,sans-serif' }}>
        {loading ? '⏳ Sending...' : '💬 Send via WhatsApp'}
      </button>
      <p style={{ fontSize: 12, color: '#9A8070', textAlign: 'center', marginTop: 8 }}>
        Saves your enquiry &amp; opens WhatsApp automatically.
      </p>

      <style>{`input:focus,select:focus,textarea:focus{ border-color:#C8884A !important; } `}</style>
    </div>
  );
}

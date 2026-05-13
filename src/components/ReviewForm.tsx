'use client';
// src/components/ReviewForm.tsx
import { useState } from 'react';

export default function ReviewForm() {
  const [form, setForm] = useState({ name: '', role: '', rating: 5, message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      setError('Name and review message are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#0E0B08',
    border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8,
    padding: '11px 14px', fontSize: 14, color: '#F0E8DC',
    fontFamily: 'Outfit, sans-serif', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🙏</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#F0E8DC', marginBottom: 8 }}>
        Thank You!
      </div>
      <p style={{ color: '#9A8070', fontSize: 14 }}>
        Your review has been submitted and will appear after approval.
      </p>
    </div>
  );

  return (
    <div style={{ background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 20, padding: 32 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: '#F0E8DC', marginBottom: 6 }}>
        Write a Review
      </div>
      <p style={{ fontSize: 13, color: '#9A8070', marginBottom: 24 }}>Share your experience with other customers</p>

      {/* Star Rating */}
      <div style={{ marginBottom: 18 }}>
        <label style={lbl}>Your Rating *</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => set('rating', n)}
              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', filter: n <= form.rating ? 'none' : 'grayscale(1) opacity(0.4)', transition: 'filter 0.15s' }}>
              ⭐
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={lbl}>Your Name *</label>
          <input style={inp} placeholder="e.g. Rajan Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Your Role / City</label>
          <input style={inp} placeholder="e.g. Homeowner, Karur" value={form.role} onChange={e => set('role', e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Your Review *</label>
        <textarea style={{ ...inp, resize: 'none' }} rows={4}
          placeholder="Tell us about your experience with Karur Plywood & Company..."
          value={form.message} onChange={e => set('message', e.target.value)} />
      </div>

      {error && <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: '100%', background: loading ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer', fontFamily: 'Outfit,sans-serif' }}>
        {loading ? '⏳ Submitting...' : '⭐ Submit Review'}
      </button>

      <style>{`input:focus,textarea:focus{ border-color:#C8884A !important; }`}</style>
    </div>
  );
}

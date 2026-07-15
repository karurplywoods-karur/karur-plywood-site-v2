'use client';
// src/components/ProductReviews.tsx
// Fetches approved reviews + submit form for the product detail page.
import { useEffect, useState } from 'react';

interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  message: string;
  created_at: string;
}

export default function ProductReviews({ productName }: { productName: string }) {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ name: '', role: '', rating: 5, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setReviews(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      setError('Please fill in your name and review.'); return;
    }
    setError(''); setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: form.role || 'Customer' }),
      });
      if (!res.ok) throw new Error('Failed');
      setDone(true); setShowForm(false);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  return (
    <div>
      <div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F07316', marginBottom: 8 }}>
              Customer Reviews
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 700, color: '#0B2447' }}>
                {reviews.length > 0 ? avg.toFixed(1) : '—'}
              </span>
              {reviews.length > 0 && (
                <span style={{ color: '#F07316', fontSize: '1.1rem', letterSpacing: 2 }}>
                  {'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}
                </span>
              )}
              <span style={{ fontSize: 13, color: '#6B7280' }}>
                {reviews.length > 0 ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}` : 'No reviews yet'}
              </span>
            </div>
          </div>
          {!done && (
            <button
              onClick={() => setShowForm(s => !s)}
              style={{ padding: '10px 22px', borderRadius: 8, background: showForm ? '#FFE8D6' : '#FFF4ED', border: '1px solid rgba(240,115,22,0.3)', color: '#F07316', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
              {showForm ? '✕ Close' : '✏️ Write a Review'}
            </button>
          )}
        </div>

        {/* Success message */}
        {done && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px 20px', marginBottom: 28, color: '#16a34a', fontSize: 14 }}>
            ✅ Thank you for your review! It will appear once approved by our team.
          </div>
        )}

        {/* Review form */}
        {showForm && !done && (
          <div style={{ background: '#FAF8F5', border: '1px solid #E5E1DC', borderRadius: 14, padding: '28px 24px', marginBottom: 36 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              Your Review for {productName}
            </div>

            {/* Star rating */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Rating</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => set('rating', n)}
                    style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: n <= form.rating ? '#F07316' : '#D1CBC2', padding: 0, transition: 'color 0.1s' }}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Your Name *</div>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ravi Kumar"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#FFFFFF', border: '1px solid #E5E1DC', color: '#0B2447', fontSize: 14, boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>You Are</div>
                <select value={form.role} onChange={e => set('role', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#FFFFFF', border: '1px solid #E5E1DC', color: '#0B2447', fontSize: 14 }}>
                  <option value="">Select...</option>
                  <option value="Homeowner">Homeowner</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Interior Designer">Interior Designer</option>
                  <option value="Builder">Builder</option>
                  <option value="Architect">Architect</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Your Review *</div>
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder={`Share your experience with ${productName}...`} rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#FFFFFF', border: '1px solid #E5E1DC', color: '#0B2447', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' as const }} />
            </div>

            {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <button onClick={handleSubmit} disabled={submitting}
              style={{ padding: '12px 28px', borderRadius: 8, background: submitting ? '#D9640F' : '#F07316', color: 'white', border: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: submitting ? 'default' : 'pointer' }}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Review list */}
        {loading ? (
          <div style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', padding: '32px 0', border: '1px dashed #E5E1DC', borderRadius: 12 }}>
            No reviews yet — be the first to share your experience with this product.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background: '#FFFFFF', border: '1px solid #E5E1DC', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#F07316,#FF9A45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0B2447', fontSize: 14 }}>{r.name}</div>
                      {r.role && <div style={{ fontSize: 11, color: '#6B7280', fontFamily: "'Syne',sans-serif", fontWeight: 600, letterSpacing: '.06em' }}>{r.role}</div>}
                    </div>
                  </div>
                  <span style={{ color: '#F07316', fontSize: 14, letterSpacing: 2 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: 0 }}>{r.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

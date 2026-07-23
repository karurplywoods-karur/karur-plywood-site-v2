'use client';
// src/components/EnquiryForm.tsx
import { useState } from 'react';
import { CONTACT } from '@/lib/contact';

const WA = CONTACT.wa;

const SUBJECTS = [
  'Product Enquiry',
  'Bulk / Wholesale Order',
  'BOM / Project Quote',
  'Delivery Question',
  'Complaint / Support',
  'Other',
];

interface Props { compact?: boolean; }

export default function EnquiryForm({ compact }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Name, phone, and email are required.');
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
      const text = `Hi, my name is ${form.name}. Phone: ${form.phone}. ${form.subject ? `Subject: ${form.subject}. ` : ''}${form.message}`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#FAF8F5',
    border: '1px solid #E5E1DC', borderRadius: 8,
    padding: '11px 14px', fontSize: 14, color: '#0B2447',
    fontFamily: "'Inter', sans-serif", outline: 'none',
    marginBottom: 0, boxSizing: 'border-box',
  };
  const label: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#374151', marginBottom: 6,
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: compact ? '24px 0' : '40px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700, color: '#0B2447', marginBottom: 8 }}>
        Message Sent!
      </div>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>
        WhatsApp has opened with your message. We&apos;ll reply within minutes.
      </p>
      <button onClick={() => { setDone(false); setForm({ name: '', phone: '', email: '', subject: '', message: '' }); }}
        style={{ background: '#FFFFFF', border: '1px solid #E5E1DC', borderRadius: 8, color: '#0B2447', padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>
        Send Another Message
      </button>
    </div>
  );

  return (
    <div>
      {!compact && (
        <>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700, color: '#0B2447', marginBottom: 6 }}>
            Send Us a Message
          </div>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 22 }}>Fill in the form below and our team will get back to you shortly.</p>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={label}>Full Name *</label>
          <input style={inp} placeholder="Enter your full name" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label style={label}>Phone Number *</label>
          <input style={inp} placeholder="Enter your phone number" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label}>Email Address *</label>
        <input style={inp} type="email" placeholder="Enter your email address" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label}>Subject *</label>
        <select style={{ ...inp }} value={form.subject} onChange={e => set('subject', e.target.value)}>
          <option value="">Select a subject</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={label}>Your Message *</label>
        <textarea style={{ ...inp, resize: 'none' }} rows={4}
          placeholder="Type your message here..."
          value={form.message} onChange={e => set('message', e.target.value)} />
      </div>

      {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: '100%', background: loading ? '#D9640F' : '#F07316', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Inter',sans-serif" }}>
        {loading ? '⏳ Sending...' : 'Send Message ➤'}
      </button>
      <p style={{ fontSize: 11.5, color: '#9CA3AF', textAlign: 'center', marginTop: 10 }}>
        This also opens WhatsApp with your message pre-filled for a faster reply.
      </p>

      <style>{`input:focus,select:focus,textarea:focus{ border-color:#F07316 !important; background:#FFFFFF !important; } `}</style>
    </div>
  );
}

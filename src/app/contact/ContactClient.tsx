'use client';
// src/app/contact/ContactClient.tsx
import { useState } from 'react';
import { CONTACT } from '@/lib/contact';

const WA = CONTACT.wa;

const TRUST_POINTS = [
  { icon: '🏆', label: '25+ Years Experience' },
  { icon: '👥', label: '1,000+ Customers Served' },
  { icon: '⚡', label: 'Same Day Response' },
];

const QUICK_TOPICS = [
  { emoji: '🪵', label: 'Plywood Price' },
  { emoji: '🎨', label: 'Laminates' },
  { emoji: '🚪', label: 'Doors' },
  { emoji: '🔩', label: 'Hardware' },
  { emoji: '📦', label: 'Bulk Order' },
];

const CONTACT_DETAILS = [
  { icon: '📞', label: 'Phone', value: CONTACT.phone, href: `tel:${CONTACT.phoneRaw}` },
  { icon: '📍', label: 'Address', value: CONTACT.address, href: 'https://maps.google.com/?q=Karur+Plywood+Company+Karur+Tamil+Nadu' },
  { icon: '⏰', label: 'Hours', value: CONTACT.hours, href: null },
  { icon: '📧', label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
];

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', phone: '', requirement: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [activeTopic, setActiveTopic] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleWADirect = (topic?: string) => {
    const text = topic
      ? `Hi, I need pricing for ${topic}. Please help.`
      : `Hi, I need plywood prices. Please help.`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
  };

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
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          message: form.requirement,
          source: 'contact_page',
        }),
      });
      setDone(true);
      const text = `Hi, my name is ${form.name} (${form.phone}). ${form.requirement || 'I need plywood pricing.'}`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="contact-hero">
        <div className="contact-container">
          <div className="contact-hero-inner">
            <div className="eyebrow">Get a Price Quote</div>
            <h1 className="contact-h1">
              Get Plywood Prices<br />
              <span style={{ color: 'var(--orange)' }}>Instantly in Karur</span>
            </h1>
            <p className="contact-sub">
              Chat on WhatsApp for the fastest response — or send your requirement below and we'll get back to you.
            </p>

            {/* Trust bar */}
            <div className="trust-bar">
              {TRUST_POINTS.map(t => (
                <div key={t.label} className="trust-item">
                  <span className="trust-icon">{t.icon}</span>
                  <span className="trust-label">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <section className="contact-body">
        <div className="contact-container">
          <div className="contact-grid">

            {/* LEFT — WhatsApp + Form */}
            <div className="contact-left">

              {/* ── WA PRIMARY BLOCK ── */}
              <div className="wa-block">
                <div className="wa-block-top">
                  <div className="wa-icon-wrap">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <div className="wa-title">⚡ Fastest Response on WhatsApp</div>
                    <div className="wa-desc">Get price, stock availability and product suggestions instantly.</div>
                  </div>
                </div>

                {/* Quick topic chips */}
                <div className="wa-topics">
                  <div className="wa-topics-label">What do you need?</div>
                  <div className="wa-chips">
                    {QUICK_TOPICS.map(t => (
                      <button
                        key={t.label}
                        className={`wa-chip${activeTopic === t.label ? ' wa-chip--active' : ''}`}
                        onClick={() => setActiveTopic(t.label)}
                      >
                        {t.emoji} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(
                    activeTopic
                      ? `Hi, I need pricing for ${activeTopic}. Please help.`
                      : `Hi, I need plywood prices from Karur Plywood & Company. Please help.`
                  )}`}
                  target="_blank"
                  rel="noopener"
                  className="wa-cta-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp{activeTopic ? ` — ${activeTopic}` : ''}
                </a>

                <div className="wa-reply-note">
                  <span className="wa-dot" />
                  Usually replies within 5 minutes
                </div>
              </div>

              {/* Divider */}
              <div className="or-divider">
                <span className="or-line" />
                <span className="or-text">or send your requirement</span>
                <span className="or-line" />
              </div>

              {/* ── QUOTE FORM ── */}
              {done ? (
                <div className="form-success">
                  <div className="form-success-icon">✅</div>
                  <div className="form-success-title">Enquiry Received!</div>
                  <p className="form-success-desc">
                    WhatsApp has opened with your message pre-filled. We'll reply within minutes.
                  </p>
                  <button
                    className="form-success-reset"
                    onClick={() => { setDone(false); setForm({ name: '', phone: '', requirement: '' }); }}
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <div className="quote-form">
                  <div className="form-header">
                    <div className="form-title">Get Price Quote</div>
                    <p className="form-subtitle">
                      Tell us your requirement and we'll suggest the best option for your budget.
                    </p>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">Your Name *</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Rajan Kumar"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Phone Number *</label>
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Your Requirement</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={4}
                      placeholder="e.g. Need 20 sheets BWP plywood 18mm for kitchen renovation in Karur"
                      value={form.requirement}
                      onChange={e => set('requirement', e.target.value)}
                    />
                  </div>

                  {error && <div className="form-error">{error}</div>}

                  <button
                    className="form-submit"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? '⏳ Sending...' : '💬 Send via WhatsApp'}
                  </button>

                  <p className="form-footnote">
                    Saves your enquiry &amp; opens WhatsApp automatically.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT — Contact details + Map */}
            <div className="contact-right">

              {/* Contact Details */}
              <div className="details-card">
                <div className="details-title">Contact Details</div>
                <div className="details-list">
                  {CONTACT_DETAILS.map(d => (
                    <div key={d.label} className="detail-item">
                      <div className="detail-icon-wrap">{d.icon}</div>
                      <div className="detail-body">
                        <div className="detail-label">{d.label}</div>
                        {d.href ? (
                          <a href={d.href} className="detail-value detail-link" target={d.href.startsWith('http') ? '_blank' : undefined} rel="noopener">
                            {d.value}
                          </a>
                        ) : (
                          <div className="detail-value">{d.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Call CTA */}
                <a href={`tel:${CONTACT.phoneRaw}`} className="call-btn">
                  📞 Call Now
                </a>
              </div>

              {/* Visit Our Store */}
              <div className="store-card">
                <div className="store-tag">📍 Visit Our Store</div>
                <div className="store-title">Come See Us in Karur</div>
                <p className="store-desc">
                  Our showroom is open {CONTACT.hours}. Browse 500+ products across plywood, laminates, doors and hardware.
                </p>

                {/* Static map placeholder */}
                <div className="map-placeholder">
                  <div className="map-grid" aria-hidden="true" />
                  <div className="map-pin">📍</div>
                  <div className="map-label">Karur Plywood &amp; Company</div>
                  <div className="map-sublabel">{CONTACT.address}</div>
                </div>

                <a
                  href="https://maps.google.com/?q=Karur+Plywood+Company+Karur+Tamil+Nadu"
                  target="_blank"
                  rel="noopener"
                  className="maps-btn"
                >
                  🗺️ Open in Google Maps
                </a>
              </div>

              {/* Working hours quick glance */}
              <div className="hours-card">
                <div className="hours-title">⏰ Business Hours</div>
                <div className="hours-list">
                  {[
                    ['Mon – Sat', '9:30 AM – 7:30 PM', false],
                    ['Sunday', 'Closed', true],
                  ].map(([day, time, closed]) => (
                    <div key={day as string} className="hours-row">
                      <span className="hours-day">{day as string}</span>
                      <span className={`hours-time${closed ? ' hours-closed' : ''}`}>{time as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM STRIP CTA ── */}
      <section className="bottom-cta">
        <div className="contact-container">
          <div className="bottom-cta-inner">
            <div>
              <div className="bottom-cta-title">Still Unsure What You Need?</div>
              <p className="bottom-cta-desc">Our experts will guide you to the right product for your project and budget.</p>
            </div>
            <a
              href={`https://wa.me/${WA}?text=Hi%2C+I%27m+not+sure+which+plywood+to+choose.+Can+you+help%3F`}
              target="_blank"
              rel="noopener"
              className="wa-cta-btn bottom-cta-btn"
            >
              💬 Ask Our Experts
            </a>
          </div>
        </div>
      </section>

      <style>{`
        /* ── LAYOUT ── */
        .contact-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 5rem;
        }

        /* ── HERO ── */
        .contact-hero {
          background: linear-gradient(160deg, #0a1627 0%, var(--navy-deep) 100%);
          border-bottom: 1px solid var(--border);
          padding: calc(58px + 64px) 0 60px;
        }
        .contact-hero-inner {
          max-width: 640px;
        }
        .contact-h1 {
          font-family: var(--f-display);
          font-size: clamp(2.6rem, 4.5vw, 3.8rem);
          letter-spacing: 0.03em;
          line-height: 0.95;
          color: var(--text);
          margin-bottom: 1rem;
        }
        .contact-sub {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.75;
          max-width: 480px;
          margin-bottom: 2rem;
          font-weight: 300;
        }

        /* Trust bar */
        .trust-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .trust-icon { font-size: 1rem; }
        .trust-label {
          font-family: var(--f-ui);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-soft);
        }

        /* ── BODY ── */
        .contact-body {
          padding: 64px 0 80px;
          background: var(--navy-deep);
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          align-items: start;
        }
        .contact-left {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .contact-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── WHATSAPP BLOCK ── */
        .wa-block {
          background: linear-gradient(135deg, rgba(37,211,102,0.08) 0%, rgba(11,36,71,0.6) 100%);
          border: 1px solid rgba(37,211,102,0.25);
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 0;
        }
        .wa-block-top {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .wa-icon-wrap {
          width: 52px;
          height: 52px;
          background: #25D366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(37,211,102,0.35);
        }
        .wa-title {
          font-family: var(--f-ui);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .wa-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Topic chips */
        .wa-topics { margin-bottom: 20px; }
        .wa-topics-label {
          font-family: var(--f-ui);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .wa-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .wa-chip {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 4px;
          padding: 6px 14px;
          font-family: var(--f-ui);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.18s;
          letter-spacing: 0.04em;
        }
        .wa-chip:hover {
          border-color: rgba(37,211,102,0.4);
          color: #4ADE80;
        }
        .wa-chip--active {
          background: rgba(37,211,102,0.1);
          border-color: rgba(37,211,102,0.5);
          color: #4ADE80;
        }

        /* WA CTA */
        .wa-cta-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 0;
          border-radius: 6px;
          background: #25D366;
          color: white;
          font-family: var(--f-ui);
          font-weight: 700;
          font-size: 0.88rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(37,211,102,0.25);
        }
        .wa-cta-btn:hover {
          background: #1fbc59;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(37,211,102,0.4);
        }
        .wa-reply-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .wa-dot {
          width: 7px;
          height: 7px;
          background: #25D366;
          border-radius: 50%;
          flex-shrink: 0;
          animation: hpulse 1.8s infinite;
        }

        /* OR divider */
        .or-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 28px 0;
        }
        .or-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .or-text {
          font-family: var(--f-ui);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          white-space: nowrap;
        }

        /* ── QUOTE FORM ── */
        .quote-form {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
        }
        .form-header { margin-bottom: 24px; }
        .form-title {
          font-family: var(--f-ui);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }
        .form-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-family: var(--f-ui);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .form-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-w);
          border-radius: 6px;
          padding: 11px 14px;
          font-size: 0.88rem;
          color: var(--text);
          font-family: var(--f-body);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus {
          border-color: var(--orange);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        .form-textarea {
          resize: none;
          line-height: 1.65;
        }
        .form-error {
          font-size: 0.8rem;
          color: #F87171;
          margin-bottom: 12px;
        }
        .form-submit {
          width: 100%;
          padding: 14px 0;
          border-radius: 6px;
          background: #25D366;
          color: white;
          border: none;
          font-family: var(--f-ui);
          font-weight: 700;
          font-size: 0.88rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(37,211,102,0.2);
        }
        .form-submit:hover:not(:disabled) {
          background: #1fbc59;
          transform: translateY(-1px);
        }
        .form-submit:disabled { opacity: 0.6; cursor: default; }
        .form-footnote {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 10px;
        }

        /* Form success state */
        .form-success {
          background: var(--surface);
          border: 1px solid rgba(37,211,102,0.2);
          border-radius: 12px;
          padding: 48px 28px;
          text-align: center;
        }
        .form-success-icon { font-size: 48px; margin-bottom: 12px; }
        .form-success-title {
          font-family: var(--f-ui);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }
        .form-success-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin-bottom: 20px;
        }
        .form-success-reset {
          background: none;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-muted);
          padding: 8px 20px;
          font-size: 0.8rem;
          cursor: pointer;
          font-family: var(--f-ui);
          transition: border-color 0.2s, color 0.2s;
        }
        .form-success-reset:hover {
          border-color: var(--orange);
          color: var(--orange);
        }

        /* ── RIGHT COLUMN ── */
        .details-card,
        .store-card,
        .hours-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }
        .details-title, .store-title, .hours-title {
          font-family: var(--f-ui);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 18px;
        }
        .details-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        .detail-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .detail-icon-wrap {
          width: 36px;
          height: 36px;
          background: var(--orange-dim);
          border: 1px solid var(--border2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .detail-body { flex: 1; }
        .detail-label {
          font-family: var(--f-ui);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 2px;
        }
        .detail-value {
          font-size: 0.85rem;
          color: var(--text-soft);
          line-height: 1.5;
        }
        .detail-link {
          text-decoration: none;
          transition: color 0.2s;
        }
        .detail-link:hover { color: var(--orange); }

        .call-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 0;
          border-radius: 6px;
          background: var(--orange);
          color: var(--navy);
          font-family: var(--f-ui);
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .call-btn:hover {
          background: var(--orange2);
          transform: translateY(-1px);
        }

        /* Store card */
        .store-tag {
          font-family: var(--f-ui);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--orange);
          margin-bottom: 6px;
        }
        .store-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin-bottom: 16px;
        }
        .map-placeholder {
          position: relative;
          height: 140px;
          border-radius: 8px;
          overflow: hidden;
          background: linear-gradient(135deg, #0d1f3a, #19376D);
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }
        .map-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.05) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .map-pin {
          font-size: 32px;
          position: relative;
          z-index: 1;
          margin-bottom: 6px;
          animation: waFloat 3s ease-in-out infinite;
        }
        .map-label {
          position: relative;
          z-index: 1;
          font-family: var(--f-ui);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }
        .map-sublabel {
          position: relative;
          z-index: 1;
          font-size: 0.68rem;
          color: var(--text-muted);
          text-align: center;
          padding: 0 12px;
        }
        .maps-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 11px 0;
          border-radius: 6px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-soft);
          font-family: var(--f-ui);
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .maps-btn:hover {
          border-color: var(--orange);
          color: var(--orange);
          background: var(--orange-dim);
        }

        /* Hours card */
        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .hours-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.83rem;
        }
        .hours-row:last-child { border-bottom: none; }
        .hours-day { color: var(--text-muted); }
        .hours-time { color: var(--text-soft); font-weight: 500; }
        .hours-closed { color: var(--text-muted); opacity: 0.5; }

        /* ── BOTTOM CTA ── */
        .bottom-cta {
          background: linear-gradient(135deg, #0a1d0f, #050f08);
          border-top: 1px solid rgba(37,211,102,0.15);
          padding: 48px 0;
        }
        .bottom-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          flex-wrap: wrap;
        }
        .bottom-cta-title {
          font-family: var(--f-display);
          font-size: 1.6rem;
          letter-spacing: 0.04em;
          color: var(--text);
          margin-bottom: 4px;
        }
        .bottom-cta-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .bottom-cta-btn {
          width: auto;
          padding: 14px 32px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
          .contact-right {
            order: -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .store-card { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .contact-container { padding: 0 1.5rem; }
          .contact-right { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .trust-bar { gap: 1rem; }
          .bottom-cta-btn { width: 100%; }
        }
        @media (max-width: 480px) {
          .contact-hero { padding-top: calc(58px + 40px); padding-bottom: 40px; }
          .wa-chips { gap: 6px; }
        }
      `}</style>
    </>
  );
}

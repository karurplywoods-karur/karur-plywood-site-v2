// src/app/contact/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import EnquiryForm from '@/components/EnquiryForm';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Contact Us — Call or WhatsApp | Karur Plywood & Company',
  description: 'Contact Karur Plywood & Company. Call, WhatsApp, or visit our showroom in Karur. Get a free quote today.',
  alternates: { canonical: `${CONTACT.siteUrl}/contact` },
};

const WA = CONTACT.wa;

export default function ContactPage() {
  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 48px 60px' }} className="ct-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
          <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</a> › <span style={{ color: '#F07316', fontWeight: 600 }}>Contact Us</span>
        </div>

        {/* Hero */}
        <div className="ct-hero">
          <Image src="/images/about-showroom.jpg" alt="Karur Plywood showroom" fill style={{ objectFit: 'cover' }} priority />
          <div className="ct-hero-overlay" />
          <div className="ct-hero-copy">
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.8rem,3.4vw,2.4rem)', fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>Contact Us</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', maxWidth: 420, lineHeight: 1.7, marginBottom: 18 }}>
              We&apos;re here to help you build better. Reach out for enquiries, quotes, bulk orders or any assistance.
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <a href={`tel:${CONTACT.phoneRaw}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFFFFF', textDecoration: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>📞 {CONTACT.phone}</a>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFFFFF', textDecoration: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>💬 WhatsApp Us</a>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="ct-info-grid">
          {[
            { icon: '📍', t: 'Visit Our Showroom', body: <>{CONTACT.address}</>, link: { href: 'https://maps.google.com/?q=Karur+Plywood+Company', label: 'Get Directions →' } },
            { icon: '📞', t: 'Call Us', body: <>{CONTACT.phone}</>, sub: CONTACT.hours },
            { icon: '✉️', t: 'Email Us', body: <>{CONTACT.email}</>, sub: 'We typically reply within 30 minutes' },
            { icon: '🎧', t: 'WhatsApp Support', body: 'Chat with our team for quick updates, quotes and orders.', link: { href: `https://wa.me/${WA}`, label: 'Chat on WhatsApp →' } },
          ].map(c => (
            <div key={c.t} className="ct-info-card">
              <div className="ct-info-icon">{c.icon}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 8 }}>{c.t}</div>
              <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 4 }}>{c.body}</div>
              {c.sub && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{c.sub}</div>}
              {c.link && <a href={c.link.href} target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: 8, fontSize: 12.5, color: '#F07316', fontWeight: 700, textDecoration: 'none' }}>{c.link.label}</a>}
            </div>
          ))}
        </div>

        {/* Form + Map */}
        <div className="ct-form-map-grid">
          <div className="ct-card">
            <EnquiryForm />
          </div>
          <div className="ct-map-wrap">
            {process.env.NEXT_PUBLIC_GMAPS_EMBED_URL ? (
              <iframe src={process.env.NEXT_PUBLIC_GMAPS_EMBED_URL} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#F2EDE5' }}>
                <div style={{ fontSize: 46 }}>📍</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0B2447', textAlign: 'center' }}>Karur Plywood &amp; Company</div>
                <div style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', maxWidth: 280 }}>{CONTACT.address}</div>
                <a href="https://maps.google.com/?q=Karur+Plywood+Company" target="_blank" rel="noopener" style={{ padding: '10px 20px', borderRadius: 6, background: '#F07316', color: '#FFFFFF', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12.5, textDecoration: 'none' }}>Get Directions →</a>
              </div>
            )}
          </div>
        </div>

        {/* Feature strip */}
        <div className="ct-feature-strip">
          {[
            { i: '🎧', t: 'Expert Support', d: 'Get expert advice for the right materials' },
            { i: '📦', t: 'Bulk Orders', d: 'Special pricing for bulk and recurring orders' },
            { i: '🚚', t: 'Fast Delivery', d: 'Pan India delivery with safe packaging' },
            { i: '🛡️', t: 'Secure Payments', d: '100% safe & secure payment options' },
            { i: '✓', t: 'Trusted Quality', d: 'Branded products you can rely on' },
          ].map(f => (
            <div key={f.t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{f.i}</span>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12.5, color: '#0B2447' }}>{f.t}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ct-hero { position: relative; border-radius: 14px; overflow: hidden; height: 260px; display: flex; align-items: flex-end; margin-bottom: 28px; }
        .ct-hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(11,36,71,0.88) 0%, rgba(11,36,71,0.4) 60%, transparent 100%); z-index: 1; }
        .ct-hero-copy { position: relative; z-index: 2; padding: 28px 32px; }
        .ct-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .ct-info-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .ct-info-icon { width: 38px; height: 38px; border-radius: 8px; background: #FFF4ED; display: flex; align-items: center; justify-content: center; font-size: 17px; margin-bottom: 12px; }
        .ct-form-map-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .ct-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 12px; padding: 28px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .ct-map-wrap { border-radius: 12px; overflow: hidden; border: 1px solid #E5E1DC; min-height: 400px; }
        .ct-feature-strip { display: flex; flex-wrap: wrap; gap: 24px; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px 24px; }
        @media(max-width:1100px){ .ct-info-grid { grid-template-columns: repeat(2,1fr); } .ct-form-map-grid { grid-template-columns: 1fr; } }
        @media(max-width:640px){ .ct-pad { padding-left:16px !important; padding-right:16px !important; } .ct-info-grid { grid-template-columns: 1fr; } .ct-hero-copy { padding: 20px; } }
      `}</style>
    </div>
  );
}

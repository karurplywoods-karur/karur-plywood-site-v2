// src/app/about/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'About Us | Karur Plywood & Company — 25+ Years of Trust',
  description: "Learn about Karur Plywood & Company — Karur's leading plywood dealer with 25+ years of experience. Family-owned, customer-first.",
};

const WA = CONTACT.wa;

export default function AboutPage() {
  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 48px 60px' }} className="ab-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>About Us</span>
        </div>

        {/* Hero */}
        <div className="ab-hero">
          <Image src="/images/about-warehouse.jpg" alt="Karur Plywood warehouse" fill style={{ objectFit: 'cover' }} priority />
          <div className="ab-hero-overlay" />
          <div className="ab-hero-copy">
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.8rem,3.4vw,2.4rem)', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>About</h1>
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.8rem,3.4vw,2.4rem)', fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Karur Plywood &amp; Company</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', maxWidth: 460, lineHeight: 1.7, marginBottom: 20 }}>
              Your trusted partner for premium plywood, laminates, hardware and building materials. Supplying quality products and reliable service across Tamil Nadu.
            </p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Quality Products', 'Trusted Brands', 'Reliable Service', 'Wide Delivery'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#FFFFFF', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                  <span style={{ color: '#FF9A45' }}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="ab-story-grid">
          <div className="ab-story-img">
            <Image src="/images/about-team.jpg" alt="Karur Plywood team" fill style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ width: 40, height: 3, background: '#F07316', marginBottom: 14 }} />
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#0B2447', marginBottom: 16 }}>Our Story</h2>
            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.85, marginBottom: 14 }}>
              Karur Plywood and Company was founded with one simple belief — that quality building materials, sold at honest prices, can transform homes and livelihoods. Starting as a small retail shop in Karur, we have grown into one of the region&apos;s most trusted wholesale and retail suppliers.
            </p>
            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.85, marginBottom: 24 }}>
              Today, we serve hundreds of contractors, carpenters, builders and homeowners across Karur, Trichy, Namakkal and the surrounding districts. We work with top brands and maintain high standards so our customers get the right products, on time, every time.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[['25+', 'Years of Experience'], ['500+', 'Happy Clients'], ['500+', 'Products'], ['3', 'Districts Served']].map(([n, l]) => (
                <div key={l} style={{ borderLeft: '2px solid #E5E1DC', paddingLeft: 12 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.7rem', color: '#F07316' }}>{n}</div>
                  <div style={{ fontSize: 11.5, color: '#6B7280' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What Drives Us */}
        <div className="ab-drives-band">
          <h2 style={{ textAlign: 'center', fontFamily: "'Inter',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0B2447', marginBottom: 28 }}>What Drives Us</h2>
          <div className="ab-drives-grid">
            {[
              ['🎯', 'Quality First', 'We stock only ISI-marked, BIS-certified products from nationally trusted brands. No compromise.'],
              ['🤝', 'Customer Focused', 'Our customers are at the heart of everything we do.'],
              ['⏱️', 'On Time, Every Time', 'We value your time and ensure prompt and reliable delivery.'],
              ['🏅', 'Integrity & Trust', 'Honest business, transparent deals, and long-term relationships.'],
            ].map(([i, t, d]) => (
              <div key={t as string} className="ab-drive-card">
                <div style={{ fontSize: 26, marginBottom: 10 }}>{i}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13.5, color: '#0B2447', marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Strength */}
        <div className="ab-strength-grid">
          <div>
            <div style={{ width: 40, height: 3, background: '#F07316', marginBottom: 14 }} />
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#0B2447', marginBottom: 18 }}>Our Strength</h2>
            {[
              'Wide range of branded products under one roof',
              'Competitive pricing and best value',
              'Dedicated support for bulk orders and contractors',
              'Advanced inventory and fast dispatch',
              'Strong distribution network across Tamil Nadu',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, fontSize: 13.5, color: '#374151' }}>
                <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>{t}
              </div>
            ))}
          </div>
          <div className="ab-cta-banner">
            <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>Building stronger connections, every day.</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 20 }}>
              We are committed to powering your projects with the right materials and the right support.
            </p>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I%27d+like+to+know+more+about+Karur+Plywood.`} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 22px', background: '#F07316', color: '#FFFFFF', borderRadius: 6, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12.5, textDecoration: 'none' }}>💬 Chat With Us</a>
          </div>
        </div>

        {/* Brands strip */}
        <div className="ab-brands-strip">
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', marginBottom: 16 }}>Brands We Partner With</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {['CENTURYPLY', 'Greenlam', 'HÄFELE', 'Hettich', 'ebco', 'SLEEK', 'FEVICOL'].map(b => (
              <div key={b} className="ab-brand-chip">{b}</div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ab-hero { position: relative; border-radius: 14px; overflow: hidden; height: 300px; display: flex; align-items: flex-end; margin-bottom: 40px; }
        .ab-hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(11,36,71,0.9) 0%, rgba(11,36,71,0.5) 60%, transparent 100%); z-index: 1; }
        .ab-hero-copy { position: relative; z-index: 2; padding: 32px; }
        .ab-story-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: center; margin-bottom: 48px; }
        .ab-story-img { position: relative; aspect-ratio: 4/3.2; border-radius: 12px; overflow: hidden; background: #F2EDE5; }
        .ab-drives-band { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 14px; padding: 36px 28px; margin-bottom: 48px; }
        .ab-drives-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .ab-drive-card { text-align: center; padding: 0 8px; }
        .ab-strength-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; margin-bottom: 48px; }
        .ab-cta-banner { background: #0B2447; border-radius: 14px; padding: 32px; }
        .ab-brands-strip { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 12px; padding: 24px 28px; }
        .ab-brand-chip { padding: 12px 22px; background: #FAF8F5; border: 1px solid #E5E1DC; border-radius: 8px; font-family: 'Inter',sans-serif; font-weight: 800; font-size: 13px; color: #0B2447; }
        @media(max-width:900px){ .ab-story-grid { grid-template-columns: 1fr !important; } .ab-drives-grid { grid-template-columns: repeat(2,1fr) !important; } .ab-strength-grid { grid-template-columns: 1fr !important; } }
        @media(max-width:640px){ .ab-pad { padding-left:16px !important; padding-right:16px !important; } .ab-hero-copy { padding: 20px; } .ab-drives-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

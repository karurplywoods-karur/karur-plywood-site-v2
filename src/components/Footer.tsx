// src/components/Footer.tsx
import Link from 'next/link';
import { CONTACT } from '@/lib/contact';

const WA = CONTACT.wa;

const COMPANY_LINKS = [
  ['/about', 'About Us'],
  ['/contact', 'Contact Us'],
  ['/blog', 'Blog'],
  ['/carpenters', 'Carpenter Directory'],
  ['/architects', 'Architect Directory'],
];

const CUSTOMER_LINKS = [
  ['/shipping-returns', 'Shipping Policy'],
  ['/refund-policy', 'Return & Refund Policy'],
  ['/cancellation-policy', 'Cancellation Policy'],
  ['/warranty-policy', 'Warranty Policy'],
  ['/payment-policy', 'Payment Policy'],
  ['/orders/track', 'Track Your Order'],
];

const LEGAL_LINKS = [
  ['/privacy-policy', 'Privacy Policy'],
  ['/terms-and-conditions', 'Terms & Conditions'],
  ['/cookie-policy', 'Cookie Policy'],
  ['/disclaimer', 'Disclaimer'],
];

const RESOURCE_LINKS = [
  ['/location', 'Delivery Areas'],
  ['/products', 'Product Catalog'],
  ['/quick-order', 'Quick Order'],
  ['/bom-quote', 'BOM / Project Quote'],
  ['/sitemap.xml', 'Sitemap'],
];

const ACCOUNT_LINKS = [
  ['/auth/login', 'Login / Register'],
  ['/account/orders', 'My Orders'],
  ['/account/profile', 'My Profile'],
  ['/account/addresses', 'Saved Addresses'],
];

const CITIES = ['Karur', 'Trichy', 'Namakkal', 'Erode', 'Salem', 'Dindigul'];

export default function Footer() {
  return (
    <footer className="kp-footer">

      {/* ── Main grid ── */}
      <div className="kp-footer-main">

        {/* Brand column */}
        <div className="kp-brand-col">
          <div className="kp-footer-logo">
            <svg width="32" height="32" viewBox="0 0 34 34" fill="none">
              <rect x="3"  y="22" width="28" height="5" rx="1" fill="#F97316" opacity="0.95"/>
              <rect x="3"  y="15" width="28" height="5" rx="1" fill="#F8F9FB" opacity="0.55"/>
              <rect x="3"  y="8"  width="28" height="5" rx="1" fill="#F97316" opacity="0.65"/>
              <rect x="28" y="8"  width="3"  height="19" rx="1" fill="rgba(0,0,0,0.3)"/>
            </svg>
            <div className="logo-type">
              <span className="l1">KARUR PLYWOOD</span>
              <span className="l2">&amp; Company</span>
            </div>
          </div>
          <p className="kp-footer-desc">
            Karur&apos;s trusted wholesale &amp; retail plywood, doors, laminates and hardware store. 25+ years of quality and service.
          </p>
          <div className="kp-footer-social">
            <a href={CONTACT.social.facebook} target="_blank" rel="noopener" className="kp-social-icon" aria-label="Facebook">📘</a>
            <a href={CONTACT.social.instagram} target="_blank" rel="noopener" className="kp-social-icon" aria-label="Instagram">📸</a>
            <a href={CONTACT.social.youtube}   target="_blank" rel="noopener" className="kp-social-icon" aria-label="YouTube">▶️</a>
            <a href={`https://wa.me/${WA}`}    target="_blank" rel="noopener" className="kp-social-icon kp-social-wa" aria-label="WhatsApp">💬</a>
          </div>

          {/* Contact block */}
          <div className="kp-contact-block">
            <a href={`tel:${CONTACT.phoneRaw}`} className="kp-contact-row">
              <span className="kp-contact-icon">📞</span>{CONTACT.phone}
            </a>
            <a href={`https://wa.me/${WA}?text=Hi`} target="_blank" rel="noopener" className="kp-contact-row kp-wa-row">
              <span className="kp-contact-icon">💬</span>WhatsApp Us
            </a>
            <a href={`mailto:${CONTACT.email}`} className="kp-contact-row">
              <span className="kp-contact-icon">✉️</span>{CONTACT.email}
            </a>
            <span className="kp-contact-row kp-contact-text">
              <span className="kp-contact-icon">📍</span>
              <span>{CONTACT.address}</span>
            </span>
            <span className="kp-contact-row kp-contact-text">
              <span className="kp-contact-icon">⏰</span>{CONTACT.hours}
            </span>
            <span className="kp-contact-row kp-contact-text" style={{ opacity: 0.55, fontSize: '0.7rem' }}>
              <span className="kp-contact-icon" />Sunday: Closed
            </span>
          </div>
        </div>

        {/* Links columns */}
        <div className="kp-links-grid">
          <FooterCol title="Company"   links={COMPANY_LINKS}  />
          <FooterCol title="Customer"  links={CUSTOMER_LINKS} />
          <FooterCol title="Legal"     links={LEGAL_LINKS}    />
          <FooterCol title="Resources" links={RESOURCE_LINKS} />
          <FooterCol title="Account"   links={ACCOUNT_LINKS}  />
        </div>
      </div>

      {/* ── GST strip ── */}
      <div className="kp-gst-strip">
        <span className="kp-gst-label">GST No:</span>
        <span className="kp-gst-value">{CONTACT.gst}</span>
        <span className="kp-gst-sep">·</span>
        <span className="kp-gst-value">{CONTACT.businessName}</span>
        <span className="kp-gst-sep">·</span>
        <span className="kp-gst-value">{CONTACT.address}</span>
      </div>

      {/* ── Service areas strip ── */}
      <div className="kp-footer-areas">
        <div className="kp-footer-areas-inner">
          <span className="kp-footer-areas-label">Serving:</span>
          {CITIES.map(city => (
            <Link key={city} href={`/areas/${city.toLowerCase()}`} className="kp-footer-area-link">{city}</Link>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="kp-footer-bottom">
        <span className="kp-footer-copy">
          © 2025–2026 <span style={{ color: '#F97316' }}>Karur Plywood and Company</span>. All rights reserved.
        </span>
        <div className="kp-footer-legal-row">
          {LEGAL_LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="kp-bottom-link">{label}</Link>
          ))}
        </div>
      </div>

      <style>{`
        /* ── Base ── */
        .kp-footer {
          border-top: 1px solid rgba(249,115,22,0.15);
          background: #070F1F;
          position: relative; z-index: 1;
        }

        /* ── Main grid ── */
        .kp-footer-main {
          max-width: 1280px; margin: 0 auto;
          padding: 4rem 5rem 2.5rem;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 4rem;
        }

        /* ── Brand column ── */
        .kp-brand-col { display: flex; flex-direction: column; gap: 0; }
        .kp-footer-logo {
          display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
        }
        .logo-type { display: flex; flex-direction: column; }
        .l1 { font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.18em; color: #F8F9FB; }
        .l2 { font-family: 'Cormorant Garamond', serif; font-size: 0.75rem; color: #C8884A; letter-spacing: 0.1em; }
        .kp-footer-desc {
          font-size: 0.8rem; color: #7A8EA8; line-height: 1.8;
          max-width: 280px; font-weight: 300; margin-bottom: 1.25rem;
        }
        .kp-footer-social { display: flex; gap: 0.6rem; margin-bottom: 1.5rem; }
        .kp-social-icon {
          width: 32px; height: 32px;
          background: rgba(249,115,22,0.08);
          border: 1px solid rgba(249,115,22,0.18);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; cursor: pointer; text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .kp-social-icon:hover { background: rgba(249,115,22,0.18); border-color: rgba(249,115,22,0.4); }
        .kp-social-wa { background: rgba(37,211,102,0.1); border-color: rgba(37,211,102,0.2); }

        .kp-contact-block { display: flex; flex-direction: column; gap: 0.55rem; }
        .kp-contact-row {
          display: flex; align-items: flex-start; gap: 0.5rem;
          font-size: 0.78rem; color: #7A8EA8; text-decoration: none;
          line-height: 1.5; transition: color 0.2s;
        }
        .kp-contact-row:hover { color: #F97316; }
        .kp-contact-text { cursor: default; }
        .kp-contact-text:hover { color: #7A8EA8 !important; }
        .kp-wa-row { color: #25D366 !important; }
        .kp-wa-row:hover { color: #1aaa50 !important; }
        .kp-contact-icon { width: 14px; flex-shrink: 0; font-size: 12px; margin-top: 1px; }

        /* ── Links grid ── */
        .kp-links-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2rem;
        }
        .kp-footer-col { display: flex; flex-direction: column; }
        .kp-footer-heading {
          font-family: 'Syne', sans-serif;
          font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #F97316; margin-bottom: 1.1rem;
        }
        .kp-footer-links { display: flex; flex-direction: column; gap: 0.65rem; }
        .kp-footer-link {
          font-size: 0.78rem; color: #7A8EA8;
          text-decoration: none; transition: color 0.2s; line-height: 1.4;
        }
        .kp-footer-link:hover { color: #F97316; }

        /* ── GST strip ── */
        .kp-gst-strip {
          max-width: 1280px; margin: 0 auto;
          padding: 0.6rem 5rem;
          display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
          border-top: 1px solid rgba(249,115,22,0.06);
        }
        .kp-gst-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.58rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: #F97316;
        }
        .kp-gst-value { font-size: 0.7rem; color: #5A6E80; font-family: monospace; }
        .kp-gst-sep { color: rgba(249,115,22,0.3); font-size: 0.8rem; }

        /* ── Areas strip ── */
        .kp-footer-areas {
          border-top: 1px solid rgba(249,115,22,0.08);
          border-bottom: 1px solid rgba(249,115,22,0.08);
          background: rgba(249,115,22,0.03);
          padding: 10px 0;
        }
        .kp-footer-areas-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 5rem;
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .kp-footer-areas-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.58rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: #F97316;
        }
        .kp-footer-area-link {
          font-size: 0.7rem; color: #7A8EA8; text-decoration: none;
          font-family: 'Syne', sans-serif; font-weight: 600;
          letter-spacing: 0.06em; transition: color 0.2s;
          padding: 0 10px;
          border-left: 1px solid rgba(249,115,22,0.1);
        }
        .kp-footer-area-link:first-of-type { border-left: none; }
        .kp-footer-area-link:hover { color: #F97316; }

        /* ── Bottom bar ── */
        .kp-footer-bottom {
          border-top: 1px solid rgba(249,115,22,0.08);
          padding: 1.25rem 5rem;
          max-width: 1280px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 0.75rem;
        }
        .kp-footer-copy { font-size: 0.72rem; color: #5A6E80; }
        .kp-footer-legal-row { display: flex; gap: 1.25rem; flex-wrap: wrap; }
        .kp-bottom-link {
          font-size: 0.65rem; color: #5A6E80;
          text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .kp-bottom-link:hover { color: #F97316; }

        /* ── Responsive ── */
        @media(max-width:1200px){
          .kp-footer-main { padding: 2.5rem 2rem; gap: 2.5rem; grid-template-columns: 280px 1fr; }
          .kp-links-grid { grid-template-columns: repeat(3,1fr); }
          .kp-footer-bottom { padding: 1rem 2rem; }
          .kp-footer-areas-inner { padding: 0 2rem; }
          .kp-gst-strip { padding: 0.6rem 2rem; }
        }
        @media(max-width:900px){
          .kp-footer-main { grid-template-columns: 1fr; }
          .kp-links-grid { grid-template-columns: repeat(2,1fr); }
          .kp-footer-desc { max-width: 100%; }
        }
        @media(max-width:640px){
          .kp-footer-main { padding: 2rem 1.25rem; }
          .kp-links-grid { grid-template-columns: 1fr 1fr; }
          .kp-footer-bottom { flex-direction: column; align-items: flex-start; padding: 1rem 1.25rem; }
          .kp-footer-areas-inner { padding: 0 1.25rem; }
          .kp-gst-strip { padding: 0.6rem 1.25rem; }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="kp-footer-col">
      <div className="kp-footer-heading">{title}</div>
      <div className="kp-footer-links">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="kp-footer-link">{label}</Link>
        ))}
      </div>
    </div>
  );
}
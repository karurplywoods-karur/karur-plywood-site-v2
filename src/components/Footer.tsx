// src/components/Footer.tsx — FIXED: real phone number, clickable links, correct address
import Link from 'next/link';
import { CONTACT } from '@/lib/contact';

const WA = CONTACT.wa;

export default function Footer() {
  return (
    <footer className="kp-footer">
      <div className="kp-footer-grid">

        {/* Brand */}
        <div>
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
            Karur&apos;s trusted wholesale &amp; retail plywood, doors, laminates and hardware store.
            25+ years of quality and service.
          </p>
          {/* Social icons */}
          <div className="kp-footer-social">
            <a href={CONTACT.social.facebook} target="_blank" rel="noopener" className="kp-social-icon" aria-label="Facebook">📘</a>
            <a href={CONTACT.social.instagram} target="_blank" rel="noopener" className="kp-social-icon" aria-label="Instagram">📸</a>
            <a href={CONTACT.social.youtube} target="_blank" rel="noopener" className="kp-social-icon" aria-label="YouTube">▶️</a>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="kp-social-icon kp-social-wa" aria-label="WhatsApp">💬</a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="kp-footer-heading">Navigation</div>
          <div className="kp-footer-links">
            {[
              ['/', 'Home'],
              ['/products', 'Products'],
              ['/quick-order', 'Quick Order'],
              ['/bom-quote', 'BOM Quote'],
              ['/blog', 'Blog'],
              ['/location', 'Location'],
              ['/contact', 'Contact'],
              ['/carpenters', 'Carpenter Directory'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="kp-footer-link">{label}</Link>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="kp-footer-heading">Products</div>
          <div className="kp-footer-links">
            {[
              ['/products?category=plywood', 'Plywood'],
              ['/products?category=laminates', 'Laminates'],
              ['/products?category=doors', 'Doors'],
              ['/products?category=hardware', 'Hardware'],
              ['/quick-order', 'Quick Order'],
              ['/bom-quote', 'Upload BOM'],
            ].map(([href, label]) => (
              <Link key={label} href={href} className="kp-footer-link">{label}</Link>
            ))}
          </div>
        </div>

        {/* Contact — FIXED: real phone, clickable links */}
        <div>
          <div className="kp-footer-heading">Contact</div>
          <div className="kp-footer-links">
            {/* FIXED: real phone number, clickable */}
            <a href={`tel:${CONTACT.phoneRaw}`} className="kp-footer-link kp-footer-contact">
              📞 {CONTACT.phone}
            </a>
            {/* FIXED: clickable WhatsApp */}
            <a href={`https://wa.me/${WA}?text=Hi`} target="_blank" rel="noopener" className="kp-footer-link" style={{ color: '#25D366' }}>
              💬 WhatsApp Us
            </a>
            {/* FIXED: clickable email */}
            <a href="mailto:karurplywoods@gmail.com" className="kp-footer-link kp-footer-contact">
              ✉️ karurplywoods@gmail.com
            </a>
            {/* FIXED: real address */}
            <span className="kp-footer-info">
              📍 Covai Main Road, Reddipalayam<br />
              &nbsp;&nbsp;&nbsp;&nbsp;Karur, Tamil Nadu – 639 008
            </span>
            <span className="kp-footer-info">⏰ {CONTACT.hours}</span>
            <span className="kp-footer-info" style={{ color:'#7A8EA8', opacity:0.6, fontSize:'0.7rem' }}>{CONTACT.sundayHours}</span>
          </div>
        </div>
      </div>

      {/* Service areas strip */}
      <div className="kp-footer-areas">
        <div className="kp-footer-areas-inner">
          <span className="kp-footer-areas-label">Serving:</span>
          {['Karur', 'Trichy', 'Namakkal', 'Erode', 'Salem', 'Dindigul'].map(city => (
            <Link key={city} href={`/areas/${city.toLowerCase()}`} className="kp-footer-area-link">{city}</Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="kp-footer-bottom">
        <span className="kp-footer-copy">
          © 2025 <span style={{ color: '#F97316' }}>Karur Plywood and Company</span>. All rights reserved.
        </span>
        <div className="kp-footer-legal">
          <Link href="/sitemap.xml" style={{ fontSize:'0.7rem', color:'#7A8EA8', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase', transition:'color 0.2s' }}>Sitemap</Link>
          <Link href="/location" style={{ fontSize:'0.7rem', color:'#7A8EA8', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase', transition:'color 0.2s' }}>Store Location</Link>
        </div>
      </div>

      <style>{`
        .kp-footer {
          border-top: 1px solid rgba(249,115,22,0.15);
          background: #070F1F;
          position: relative; z-index: 1;
        }
        .kp-footer-grid {
          max-width: 1200px; margin: 0 auto;
          padding: 4rem 5rem 2.5rem;
          display: grid; grid-template-columns: 2fr 1fr 1fr 1.2fr; gap: 3rem;
        }
        .kp-footer-logo {
          display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
        }
        .kp-footer-desc {
          font-size: 0.82rem; color: #7A8EA8; line-height: 1.8;
          max-width: 260px; font-weight: 300; margin-bottom: 1.5rem;
        }
        .kp-footer-social {
          display: flex; gap: 0.7rem;
        }
        .kp-social-icon {
          width: 34px; height: 34px;
          background: rgba(249,115,22,0.08);
          border: 1px solid rgba(249,115,22,0.18);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; cursor: pointer; text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .kp-social-icon:hover {
          background: rgba(249,115,22,0.16);
          border-color: rgba(249,115,22,0.4);
        }
        .kp-social-wa {
          background: rgba(37,211,102,0.1);
          border-color: rgba(37,211,102,0.2);
        }
        .kp-footer-heading {
          font-family: 'Syne', sans-serif;
          font-size: 0.62rem; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #F97316; margin-bottom: 1.2rem;
        }
        .kp-footer-links {
          display: flex; flex-direction: column; gap: 0.8rem;
        }
        .kp-footer-link {
          font-size: 0.82rem; color: #7A8EA8;
          text-decoration: none; transition: color 0.2s;
        }
        .kp-footer-link:hover { color: #F97316; }
        .kp-footer-contact {
          font-weight: 500; color: #A8BCCC !important;
        }
        .kp-footer-contact:hover { color: #F97316 !important; }
        .kp-footer-info {
          font-size: 0.78rem; color: #7A8EA8; line-height: 1.6;
        }

        /* Service areas strip */
        .kp-footer-areas {
          border-top: 1px solid rgba(249,115,22,0.08);
          border-bottom: 1px solid rgba(249,115,22,0.08);
          background: rgba(249,115,22,0.03);
          padding: 12px 0;
        }
        .kp-footer-areas-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 5rem;
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .kp-footer-areas-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.58rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: #F97316;
        }
        .kp-footer-area-link {
          font-size: 0.72rem; color: #7A8EA8; text-decoration: none;
          font-family: 'Syne', sans-serif; font-weight: 600;
          letter-spacing: 0.06em;
          transition: color 0.2s;
          padding: 0 10px;
          border-left: 1px solid rgba(249,115,22,0.1);
        }
        .kp-footer-area-link:first-of-type { border-left: none; }
        .kp-footer-area-link:hover { color: #F97316; }

        .kp-footer-bottom {
          border-top: 1px solid rgba(249,115,22,0.1);
          padding: 1.25rem 5rem;
          max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 0.75rem;
        }
        .kp-footer-copy { font-size: 0.73rem; color: #7A8EA8; }
        .kp-footer-legal {
          display: flex; gap: 1.5rem;
        }
        .kp-footer-legal a:hover { color: #F97316 !important; }

        @media(max-width:1100px){
          .kp-footer-grid { grid-template-columns: 1fr 1fr !important; padding: 2.5rem 2rem !important; }
          .kp-footer-bottom { padding: 1rem 2rem !important; }
          .kp-footer-areas-inner { padding: 0 2rem !important; }
        }
        @media(max-width:640px){
          .kp-footer-grid { grid-template-columns: 1fr !important; }
          .kp-footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
}

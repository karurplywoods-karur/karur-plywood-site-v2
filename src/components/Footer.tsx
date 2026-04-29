// src/components/Footer.tsx
import Link from 'next/link';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

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
            Karur&apos;s trusted wholesale &amp; retail plywood, doors, laminates and hardware store. 25+ years of quality and service.
          </p>
          <div className="kp-footer-social">
            {['📘','📸','▶️'].map(icon => (
              <div key={icon} className="kp-social-icon">{icon}</div>
            ))}
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="kp-social-icon kp-social-wa">💬</a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="kp-footer-heading">Navigation</div>
          <div className="kp-footer-links">
            {[['/', 'Home'],['/products','Products'],['/quick-order','Quick Order'],['/blog','Blog'],['/location','Location'],['/contact','Contact'],['/carpenters','Carpenter Directory']].map(([href, label]) => (
              <Link key={href} href={href} className="kp-footer-link">{label}</Link>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="kp-footer-heading">Products</div>
          <div className="kp-footer-links">
            {['Plywood','Doors','Laminates','Hardware','Quick Order'].map(p => (
              <Link key={p} href="/products" className="kp-footer-link">{p}</Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="kp-footer-heading">Contact</div>
          <div className="kp-footer-links">
            <span className="kp-footer-info">📞 +91 99999 99999</span>
            <span className="kp-footer-info">📍 Karur, Tamil Nadu</span>
            <span className="kp-footer-info">⏰ Mon–Sat: 9AM–7PM</span>
            <a href={`https://wa.me/${WA}?text=Hi`} target="_blank" rel="noopener" className="kp-footer-link" style={{ color: '#25D366', fontWeight: 600 }}>
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="kp-footer-bottom">
        <span className="kp-footer-copy">
          © 2025 <span style={{ color: '#F97316' }}>Karur Plywood and Company</span>. All rights reserved.
        </span>
        <div className="kp-footer-legal">
          <span>Privacy Policy</span>
          <span>Sitemap</span>
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
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem;
        }
        .kp-footer-logo {
          display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
        }
        .kp-footer-desc {
          font-size: 0.85rem; color: #7A8EA8; line-height: 1.8;
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
          font-size: 15px; cursor: pointer;
          text-decoration: none;
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
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .kp-footer-link {
          font-size: 0.82rem; color: #7A8EA8;
          text-decoration: none; transition: color 0.2s;
        }
        .kp-footer-link:hover { color: #F97316; }
        .kp-footer-info {
          font-size: 0.82rem; color: #7A8EA8;
        }
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
        .kp-footer-legal span {
          font-size: 0.7rem; color: #7A8EA8; cursor: pointer;
          letter-spacing: 0.1em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .kp-footer-legal span:hover { color: #F97316; }
        @media(max-width:900px){
          .kp-footer-grid { grid-template-columns: 1fr 1fr !important; padding: 2.5rem 1.5rem !important; }
          .kp-footer-bottom { padding: 1rem 1.5rem !important; }
        }
        @media(max-width:560px){
          .kp-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

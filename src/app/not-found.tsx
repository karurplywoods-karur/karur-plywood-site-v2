// src/app/not-found.tsx
// Custom 404 page â€” shown for any unmatched route.
// Matches the site's dark navy / orange design system.
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 â€” Page Not Found',
  robots: { index: false, follow: false },
};

const QUICK_LINKS = [
  { href: '/products',     label: 'ðŸ“¦ Browse Products'    },
  { href: '/location',     label: 'ðŸ“ Delivery Areas'     },
  { href: '/quick-order',  label: 'âš¡ Quick Order'        },
  { href: '/contact',      label: 'ðŸ“ž Contact Us'         },
  { href: '/blog',         label: 'ðŸ“– Blog'               },
];

export default function NotFoundPage() {
  return (
    <main style={{
      minHeight: '80vh',
      background: 'linear-gradient(160deg,#070F1F,#0a1628)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px',
    }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* Large 404 */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(6rem, 18vw, 9rem)',
            fontWeight: 700,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(249,115,22,0.25)',
            lineHeight: 1,
            display: 'block',
            letterSpacing: '-0.02em',
          }}>404</span>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.08), transparent 70%)',
          }} />
        </div>

        {/* Plywood icon */}
        <div style={{ fontSize: 44, marginBottom: 20 }}>ðŸªµ</div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700, color: '#F8F9FB',
          margin: '0 0 12px', lineHeight: 1.2,
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: 15, color: '#7A8EA8',
          lineHeight: 1.7, margin: '0 0 36px',
          maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
        }}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Let us help you find what you need.
        </p>

        {/* Quick links grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10, marginBottom: 32,
        }}>
          {QUICK_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="nf-quick-link">
              {label}
            </Link>
          ))}
        </div>

        {/* Back to home CTA */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '13px 32px', borderRadius: 10,
          background: 'linear-gradient(135deg,#C8884A,#8B5E2A)',
          color: '#fff', fontFamily: "'Syne', sans-serif",
          fontWeight: 700, fontSize: '0.78rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'opacity 0.2s',
        }}>
          â† Back to Home
        </Link>

        {/* WhatsApp help */}
        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 13, color: '#5A6E80', marginBottom: 10 }}>
            Can&apos;t find what you&apos;re looking for?
          </p>
          <a href="https://wa.me/919159666538?text=Hi%2C+I+need+help+finding+a+product"
            target="_blank" rel="noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: '#25D366', fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
            }}>
            ðŸ’¬ Ask us on WhatsApp
          </a>
        </div>

      </div>

      <style>{`
        .nf-quick-link {
          display: block;
          padding: 11px 14px;
          background: rgba(249,115,22,0.05);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 10px;
          color: #C8B8A0;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }
        .nf-quick-link:hover {
          background: rgba(249,115,22,0.1);
          border-color: rgba(249,115,22,0.35);
          color: #F8F9FB;
        }
      `}</style>
    </main>
  );
}


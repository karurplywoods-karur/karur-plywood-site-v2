// src/components/LegalPageLayout.tsx
// Shared layout for all legal / policy pages.
// Matches the site's dark navy / orange design system.
import { ReactNode } from 'react';
import { CONTACT } from '@/lib/contact';

export default function LegalPageLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg,#0a1d3a,#070F1F)',
        borderBottom: '1px solid rgba(249,115,22,0.15)',
        padding: 'calc(58px + 48px) 0 40px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'inline-block', marginBottom: 12,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 999, padding: '4px 14px',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, color: '#F97316',
          }}>Legal</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 'clamp(1.9rem,4vw,2.75rem)',
            fontWeight: 700, color: '#F8F9FB', margin: '0 0 10px',
            lineHeight: 1.2,
          }} dangerouslySetInnerHTML={{ __html: title }} />
          <p style={{ color: '#5A6E80', fontSize: 12, margin: 0 }}>
            Last updated: {updated} Â· {CONTACT.businessName}
          </p>
        </div>
      </section>

      {/* Content */}
      <main style={{
        maxWidth: 780, margin: '0 auto',
        padding: '52px 24px 96px',
        color: '#2B2B2B',
      }}>
        <div className="legal-body">{children}</div>
      </main>

      <style>{`
        .legal-body h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.45rem; font-weight: 700;
          color: #0B2447; margin: 40px 0 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(11,36,71,0.08);
        }
        .legal-body h2:first-of-type { margin-top: 0; }
        .legal-body p {
          font-size: 15px; line-height: 1.8;
          color: #3A3A3A; margin: 0 0 14px;
        }
        .legal-body ul, .legal-body ol {
          margin: 0 0 16px; padding-left: 22px;
        }
        .legal-body li {
          font-size: 15px; line-height: 1.75;
          color: #3A3A3A; margin-bottom: 7px;
        }
        .legal-body a {
          color: #F97316; text-decoration: underline;
          text-underline-offset: 2px;
        }
        .legal-body a:hover { color: #d96110; }
        .legal-body strong { color: #0B2447; font-weight: 600; }
        .legal-body code {
          background: #f3f4f6; border-radius: 3px;
          padding: 1px 5px; font-size: 13px; color: #374151;
        }
        .legal-body table {
          width: 100%; border-collapse: collapse;
          margin-bottom: 18px; font-size: 14px;
        }
        .legal-body th {
          text-align: left; padding: 8px 12px 8px 0;
          color: #0B2447; font-weight: 700;
          border-bottom: 2px solid #e5e7eb;
        }
        .legal-body td {
          padding: 10px 12px 10px 0;
          color: #444; line-height: 1.6;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
        }
        @media(max-width:640px){
          .legal-body h2 { font-size: 1.25rem; }
          .legal-body p, .legal-body li { font-size: 14px; }
        }
      `}</style>
    </>
  );
}


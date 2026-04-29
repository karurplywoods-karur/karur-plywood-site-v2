'use client';
// src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

const NAV_LINKS = [
  { href: '/',            label: 'Home' },
  { href: '/products',    label: 'Products' },
  { href: '/quick-order', label: 'Quick Order' },
  { href: '/bom-quote',   label: 'BOM Quote' },
  { href: '/carpenters',  label: 'Carpenters' },
  { href: '/architect',   label: 'Architect' },
  { href: '/blog',        label: 'Blog' },
  { href: '/contact',     label: 'Contact' },
];

function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect x="3"  y="22" width="28" height="5" rx="1" fill="#F97316" opacity="0.95"/>
      <rect x="3"  y="15" width="28" height="5" rx="1" fill="#F8F9FB" opacity="0.55"/>
      <rect x="3"  y="8"  width="28" height="5" rx="1" fill="#F97316" opacity="0.65"/>
      <rect x="28" y="8"  width="3"  height="19" rx="1" fill="rgba(0,0,0,0.3)"/>
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <nav className={`kp-nav${scrolled ? ' kp-nav--scrolled' : ''}`}>
        <Link href="/" className="logo-wrap">
          <LogoMark />
          <div className="logo-type">
            <span className="l1">KARUR PLYWOOD</span>
            <span className="l2">&amp; Company · Est. Karur</span>
          </div>
        </Link>

        {/* Desktop */}
        <ul className="kp-nav-links hidden-mobile">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`kp-nav-link${pathname === href ? ' kp-nav-link--active' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={`https://wa.me/${WA}?text=Hi%2C+I+want+to+enquire+about+your+products.`}
              target="_blank"
              rel="noopener"
              className="kp-nav-cta"
            >
              Enquire Now ↗
            </a>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className="kp-hamburger show-mobile"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation menu"
        >
          <span className={menuOpen ? 'kp-ham-1--open' : ''} />
          <span className={menuOpen ? 'kp-ham-2--open' : ''} />
          <span className={menuOpen ? 'kp-ham-3--open' : ''} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="kp-mobile-menu">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`kp-mobile-link${pathname === href ? ' kp-mobile-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
          <a
            href={`https://wa.me/${WA}?text=Hi%2C+I+want+to+enquire.`}
            target="_blank"
            rel="noopener"
            className="kp-mobile-cta"
            onClick={() => setMenuOpen(false)}
          >
            Enquire Now ↗
          </a>
        </div>
      )}

      <style>{`
        /* ── NAV BASE ── */
        .kp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.1rem 5rem;
          background: rgba(11,36,71,0.70);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(249,115,22,0.15);
          transition: padding 0.3s, background 0.3s;
        }
        .kp-nav--scrolled {
          padding: 0.75rem 5rem;
          background: rgba(7,15,31,0.94);
        }

        /* ── DESKTOP LINKS ── */
        .kp-nav-links {
          display: flex; gap: 2.2rem; list-style: none; align-items: center;
        }
        .kp-nav-link {
          font-family: 'Syne', sans-serif;
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #7A8EA8; text-decoration: none;
          padding-bottom: 4px;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .kp-nav-link:hover { color: #F8F9FB; border-bottom-color: rgba(249,115,22,0.4); }
        .kp-nav-link--active { color: #F8F9FB; border-bottom-color: #F97316; }

        /* ── CTA BUTTON ── */
        .kp-nav-cta {
          font-family: 'Syne', sans-serif;
          background: #F97316; color: #0B2447;
          padding: 0.45rem 1.3rem; border-radius: 3px;
          font-weight: 700; font-size: 0.78rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          display: inline-block;
        }
        .kp-nav-cta:hover { background: #FF9A45; transform: translateY(-1px); }

        /* ── HAMBURGER ── */
        .kp-hamburger {
          background: none; border: none; cursor: pointer;
          padding: 4px; display: none;
          flex-direction: column; gap: 5px;
        }
        .kp-hamburger span {
          display: block; width: 24px; height: 2px;
          background: #F8F9FB; border-radius: 2px;
          transition: all 0.3s;
        }
        .kp-ham-1--open { transform: rotate(45deg) translate(5px,5px); }
        .kp-ham-2--open { opacity: 0; }
        .kp-ham-3--open { transform: rotate(-45deg) translate(5px,-5px); }

        /* ── MOBILE MENU ── */
        .kp-mobile-menu {
          position: fixed; top: 70px; left: 0; right: 0; z-index: 499;
          background: rgba(7,15,31,0.97);
          border-bottom: 1px solid rgba(249,115,22,0.15);
          padding: 1rem 1.5rem 1.5rem;
          display: flex; flex-direction: column; gap: 0;
        }
        .kp-mobile-link {
          padding: 0.85rem 1rem;
          font-family: 'Syne', sans-serif;
          font-size: 0.88rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #7A8EA8;
          border-bottom: 1px solid rgba(249,115,22,0.08);
          text-decoration: none;
          transition: color 0.2s;
        }
        .kp-mobile-link:hover,
        .kp-mobile-link--active { color: #F97316; }
        .kp-mobile-cta {
          margin-top: 12px; padding: 0.85rem;
          text-align: center;
          background: #F97316; color: #0B2447;
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 0.82rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          border-radius: 3px; text-decoration: none;
          display: block;
          transition: background 0.2s;
        }
        .kp-mobile-cta:hover { background: #FF9A45; }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) {
          .kp-nav { padding: 1rem 1.5rem !important; }
          .kp-nav--scrolled { padding: 0.75rem 1.5rem !important; }
          .kp-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

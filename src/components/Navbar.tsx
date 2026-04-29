‘use client’;
// src/components/Navbar.tsx
import { useState, useEffect, useRef } from ‘react’;
import Link from ‘next/link’;
import { usePathname } from ‘next/navigation’;

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || ‘919999999999’;

// Only 4 primary links visible on desktop — clean and spacious
const PRIMARY = [
{ href: ‘/’,            label: ‘Home’ },
{ href: ‘/products’,    label: ‘Products’ },
{ href: ‘/quick-order’, label: ‘Quick Order’ },
{ href: ‘/contact’,     label: ‘Contact’ },
];

// Secondary links hidden in “More” dropdown
const MORE = [
{ href: ‘/blog’,       label: ‘Blog’ },
{ href: ‘/bom-quote’,  label: ‘BOM Quote’ },
{ href: ‘/carpenters’, label: ‘Carpenters’ },
{ href: ‘/architects’, label: ‘Architects’ },
];

const ALL_LINKS = […PRIMARY, …MORE];

function LogoMark() {
return (
<svg width=“28” height=“28” viewBox=“0 0 34 34” fill=“none” aria-hidden=“true” style={{ flexShrink:0 }}>
<rect x="3" y="22" width="28" height="5" rx="1" fill="#F97316" opacity="0.95"/>
<rect x="3" y="15" width="28" height="5" rx="1" fill="#F8F9FB" opacity="0.55"/>
<rect x="3" y="8"  width="28" height="5" rx="1" fill="#F97316" opacity="0.65"/>
<rect x="28" y="8" width="3"  height="19" rx="1" fill="rgba(0,0,0,0.3)"/>
</svg>
);
}

export default function Navbar() {
const pathname  = usePathname();
const [scrolled, setScrolled] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const [moreOpen, setMoreOpen] = useState(false);
const moreRef = useRef<HTMLLIElement>(null);

useEffect(() => {
const onScroll = () => setScrolled(window.scrollY > 20);
window.addEventListener(‘scroll’, onScroll);
return () => window.removeEventListener(‘scroll’, onScroll);
}, []);

// Close “More” dropdown on outside click
useEffect(() => {
const handler = (e: MouseEvent) => {
if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
setMoreOpen(false);
}
};
document.addEventListener(‘mousedown’, handler);
return () => document.removeEventListener(‘mousedown’, handler);
}, []);

if (pathname.startsWith(’/admin’)) return null;

const isMoreActive = MORE.some(l => pathname === l.href);

return (
<>
<nav className={`kp-nav${scrolled ? ' kp-nav--scrolled' : ''}`}>

```
    {/* Logo */}
    <Link href="/" className="logo-wrap" style={{ gap: '0.55rem' }}>
      <LogoMark />
      <div className="logo-type">
        <span className="l1" style={{ fontSize: '1.1rem' }}>KARUR PLYWOOD</span>
        <span className="l2" style={{ fontSize: '0.42rem' }}>&amp; Company · Karur, Tamil Nadu</span>
      </div>
    </Link>

    {/* Desktop links */}
    <ul className="kp-nav-links">

      {PRIMARY.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            className={`kp-nav-link${pathname === href ? ' kp-nav-link--active' : ''}`}
          >
            {label}
          </Link>
        </li>
      ))}

      {/* More dropdown */}
      <li ref={moreRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setMoreOpen(o => !o)}
          className={`kp-nav-link kp-more-btn${isMoreActive ? ' kp-nav-link--active' : ''}`}
          aria-expanded={moreOpen}
        >
          More
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
            style={{ marginLeft: 3, transition: 'transform 0.2s', transform: moreOpen ? 'rotate(180deg)' : 'none' }}>
            <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </button>

        {moreOpen && (
          <div className="kp-dropdown">
            {MORE.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`kp-dropdown-item${pathname === href ? ' kp-dropdown-item--active' : ''}`}
                onClick={() => setMoreOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </li>

      {/* CTA */}
      <li>
        <a
          href={`https://wa.me/${WA}?text=Hi%2C+I+want+to+enquire+about+your+products.`}
          target="_blank"
          rel="noopener"
          className="kp-nav-cta"
        >
          💬 Enquire
        </a>
      </li>
    </ul>

    {/* Hamburger — mobile only */}
    <button
      className="kp-hamburger"
      onClick={() => setMenuOpen(o => !o)}
      aria-label="Toggle menu"
    >
      <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
      <span style={{ opacity: menuOpen ? 0 : 1 }} />
      <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
    </button>
  </nav>

  {/* Mobile menu */}
  {menuOpen && (
    <div className="kp-mobile-menu">
      {ALL_LINKS.map(({ href, label }) => (
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
        target="_blank" rel="noopener"
        className="kp-mobile-cta"
        onClick={() => setMenuOpen(false)}
      >
        💬 Enquire on WhatsApp
      </a>
    </div>
  )}

  <style>{`
    .kp-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 500;
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.7rem 4rem;
      background: rgba(7,15,31,0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(249,115,22,0.12);
      transition: padding 0.3s, background 0.3s;
      height: 58px;
    }
    .kp-nav--scrolled {
      padding: 0.55rem 4rem;
      background: rgba(7,15,31,0.97);
      height: 52px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }

    /* Desktop links */
    .kp-nav-links {
      display: flex;
      gap: 1.6rem;
      list-style: none;
      align-items: center;
    }
    .kp-nav-link {
      font-family: 'Syne', sans-serif;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #7A8EA8;
      text-decoration: none;
      padding-bottom: 3px;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
      white-space: nowrap;
    }
    .kp-nav-link:hover  { color: #F8F9FB; border-bottom-color: rgba(249,115,22,0.4); }
    .kp-nav-link--active{ color: #F8F9FB; border-bottom-color: #F97316; }

    /* More button */
    .kp-more-btn {
      background: none; border: none; cursor: pointer;
      display: flex; align-items: center;
      padding-bottom: 3px;
    }

    /* Dropdown */
    .kp-dropdown {
      position: absolute; top: calc(100% + 12px); right: 0;
      background: rgba(7,15,31,0.98);
      border: 1px solid rgba(249,115,22,0.18);
      border-radius: 6px;
      min-width: 160px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
      animation: ddFade 0.15s ease;
      z-index: 600;
    }
    @keyframes ddFade {
      from { opacity:0; transform:translateY(-6px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .kp-dropdown-item {
      display: block;
      padding: 0.7rem 1.1rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: #7A8EA8; text-decoration: none;
      border-bottom: 1px solid rgba(249,115,22,0.07);
      transition: background 0.15s, color 0.15s;
    }
    .kp-dropdown-item:last-child { border-bottom: none; }
    .kp-dropdown-item:hover { background: rgba(249,115,22,0.08); color: #F97316; }
    .kp-dropdown-item--active { color: #F97316; }

    /* CTA */
    .kp-nav-cta {
      font-family: 'Syne', sans-serif;
      background: #F97316; color: #0B2447;
      padding: 0.38rem 1rem;
      border-radius: 4px;
      font-weight: 700; font-size: 0.68rem;
      letter-spacing: 0.08em; text-transform: uppercase;
      text-decoration: none;
      transition: background 0.2s, transform 0.2s;
      white-space: nowrap;
      display: inline-block;
    }
    .kp-nav-cta:hover { background: #FF9A45; transform: translateY(-1px); }

    /* Hamburger */
    .kp-hamburger {
      display: none;
      background: none; border: none; cursor: pointer;
      padding: 4px; flex-direction: column; gap: 5px;
    }
    .kp-hamburger span {
      display: block; width: 22px; height: 2px;
      background: #F8F9FB; border-radius: 2px;
      transition: all 0.3s;
    }

    /* Mobile menu */
    .kp-mobile-menu {
      position: fixed; top: 58px; left: 0; right: 0; z-index: 499;
      background: rgba(7,15,31,0.98);
      border-bottom: 1px solid rgba(249,115,22,0.15);
      padding: 0.5rem 1.5rem 1.25rem;
      display: flex; flex-direction: column;
      animation: ddFade 0.2s ease;
    }
    .kp-mobile-link {
      padding: 0.8rem 0.5rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.82rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: #7A8EA8;
      border-bottom: 1px solid rgba(249,115,22,0.07);
      text-decoration: none;
      transition: color 0.2s;
    }
    .kp-mobile-link:hover, .kp-mobile-link--active { color: #F97316; }
    .kp-mobile-cta {
      margin-top: 14px; padding: 0.85rem;
      text-align: center;
      background: #F97316; color: #0B2447;
      font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 0.8rem;
      letter-spacing: 0.08em; text-transform: uppercase;
      border-radius: 4px; text-decoration: none;
      display: block; transition: background 0.2s;
    }
    .kp-mobile-cta:hover { background: #FF9A45; }

    /* Responsive */
    @media (max-width: 960px) {
      .kp-nav { padding: 0 1.25rem !important; }
      .kp-nav-links { display: none !important; }
      .kp-hamburger { display: flex !important; }
    }
    @media (max-width: 480px) {
      .logo-type .l1 { font-size: 0.95rem !important; }
    }
  `}</style>
</>
```

);
}

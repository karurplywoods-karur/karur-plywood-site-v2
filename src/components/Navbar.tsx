'use client';
// src/components/Navbar.tsx — GLOBAL HEADER (single shared component, rendered once from layout.tsx)
// Structure: utility strip · main row (logo, deliver-to, search, account, cart) · category nav w/ mega-menus.
// Mobile: logo/menu/account/cart row · search row · deliver-to row · slide-in drawer.
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';
import { useCart } from '@/lib/CartContext';
import CartDrawer from './CartDrawer';
import DeliverTo from './header/DeliverTo';
import { useWishlist } from '@/lib/WishlistContext';

// Category groups shown in the nav bar. Each group is resolved against the existing /api/categories
// data (by slug/name keyword, plus any child categories via parent_id). Nothing here is hardcoded product data.
const NAV_GROUPS = [
  { label: 'Plywood',   keys: ['plywood'] },
  { label: 'Laminates', keys: ['laminate'] },
  { label: 'Boards',    keys: ['board', 'mdf', 'hdhmr'] },
  { label: 'Doors',     keys: ['door'] },
  { label: 'Hardware',  keys: ['hardware'] },
  { label: 'Adhesives', keys: ['adhesive'] },
];
// Existing routes that used to be top-level links; kept reachable under "More" / the mobile drawer.
const MORE = [
  { href: '/solutions',   label: 'Solutions' },
  { href: '/contact',     label: 'Contact' },
  { href: '/offers',      label: 'Offers' },
  { href: '/inspiration', label: 'Inspiration' },
  { href: '/blog',        label: 'Blog' },
  { href: '/carpenters',  label: 'Find a Carpenter' },
];
const DRAWER_LINKS = [
  { href: '/',            label: 'Home' },
  { href: '/products',    label: 'All Products' },
  ...MORE,
  { href: '/orders/track', label: 'Track Order' },
  { href: '/wishlist',    label: 'Wishlist' },
];

function CartIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
    </svg>
  );
}
function UserIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function HeartIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
  );
}
function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="logo-wrap kp-logo" style={{ gap: '.55rem' }} onClick={onClick}>
      <svg width="30" height="30" viewBox="0 0 34 34" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
        <rect x="3" y="22" width="28" height="5" rx="1" fill="#F97316" opacity=".95"/>
        <rect x="3" y="15" width="28" height="5" rx="1" className="kp-logo-mid" opacity=".8"/>
        <rect x="3" y="8"  width="28" height="5" rx="1" fill="#F97316" opacity=".65"/>
        <rect x="28" y="8" width="3"  height="19" rx="1" fill="rgba(0,0,0,0.3)"/>
      </svg>
      <div className="logo-type">
        <span className="l1" style={{ fontSize: '1.1rem' }}>KARUR PLYWOOD</span>
        <span className="l2" style={{ fontSize: '.42rem' }}>&amp; Company · Online Store</span>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();

  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [moreOpen,  setMoreOpen]  = useState(false);
  const [cartOpen,  setCartOpen]  = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const [cartBump,  setCartBump]  = useState(false);
  const [user,      setUser]      = useState<any>(null);
  const [customer,  setCustomer]  = useState<any>(null);
  const [cats,      setCats]      = useState<any[]>([]);
  const [brands,    setBrands]    = useState<any[]>([]);
  const [mega,      setMega]      = useState<string | null>(null);
  const [drawerSec, setDrawerSec] = useState<string | null>(null);

  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLLIElement>(null);
  const prevCount = useRef(count);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Category + brand data from the existing public endpoints
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (Array.isArray(d)) setCats(d); }).catch(() => {});
    fetch('/api/brands').then(r => r.json()).then(d => { if (Array.isArray(d)) setBrands(d); }).catch(() => {});
  }, []);

  // Cart bump animation
  useEffect(() => {
    if (count > prevCount.current) {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
    }
    prevCount.current = count;
  }, [count]);

  // Auth state (unchanged logic)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetch('/api/customer').then(r => r.json()).then(data => {
          if (!data.error) setCustomer(data);
        }).catch(() => {});
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session) setCustomer(null);
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close menus on outside click / route change / Escape
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMega(null); setMoreOpen(false); setMenuOpen(false); } };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { setMega(null); setMoreOpen(false); setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Resolve nav groups against category data
  const groups = useMemo(() => NAV_GROUPS.map(g => {
    const matches = cats.filter(c => g.keys.some(k => `${c.slug} ${c.name}`.toLowerCase().includes(k)));
    const children = cats.filter(c => c.parent_id != null && matches.some(m => String(m.id) === String(c.parent_id)));
    const items: any[] = [];
    [...matches, ...children].forEach(c => { if (!items.some(i => i.id === c.id)) items.push(c); });
    const exact = matches.find(c => c.slug === g.keys[0] || c.name.toLowerCase() === g.label.toLowerCase());
    const panel = items.filter(c => c !== exact);
    const href = exact ? `/category/${exact.slug}`
      : items.length === 1 ? `/category/${items[0].slug}`
      : `/products?search=${encodeURIComponent(g.keys[0])}`;
    return { ...g, href, panel, hasPanel: panel.length > 1 || (!!exact && panel.length >= 1) };
  }), [cats]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserOpen(false);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  if (pathname.startsWith('/admin')) return null;

  const isMoreActive = MORE.some(l => pathname === l.href);
  const initials = customer?.full_name
    ? customer.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const activeGroup = groups.find(g => g.label === mega);

  return (
    <>
      <nav className={`kp-nav${scrolled ? ' kp-nav--scrolled' : ''}`} aria-label="Main">

        {/* 1 — Utility strip (desktop) */}
        <div className="kp-strip">
          <div className="kp-strip-in">
            <span className="kp-strip-id">Karur Plywood &amp; Company · Trusted in Karur for 25+ years</span>
            <ul className="kp-strip-trust">
              <li><CheckIcon /> Genuine Brands</li>
              <li><CheckIcon /> Secure Payments</li>
              <li><CheckIcon /> GST Invoice</li>
            </ul>
            <span className="kp-strip-links">
              <Link href="/orders/track">Track Order</Link>
              <Link href="/contact">Contact</Link>
            </span>
          </div>
        </div>

        {/* 2 — Main row */}
        <div className="kp-main">
          <button className="kp-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <span /><span /><span />
          </button>

          <Logo />

          <div className="kp-main-dl"><DeliverTo variant="desktop" /></div>

          <div className="kp-main-search"><NavSearch /></div>

          <ul className="kp-actions">
            <li ref={userRef} className="kp-act-li">
              {user ? (
                <>
                  <button onClick={() => setUserOpen(o => !o)} className="kp-act" aria-expanded={userOpen} aria-label="Account menu">
                    <span className="user-avatar">{initials}</span>
                    <span className="kp-act-label">Account</span>
                  </button>
                  {userOpen && (
                    <div className="user-dropdown">
                      <div className="user-dropdown-header">
                        <div className="user-dropdown-name">{customer?.full_name || user.email}</div>
                        <div className="user-dropdown-email">{user.email}</div>
                      </div>
                      <Link href="/account" className="user-dropdown-item" onClick={() => setUserOpen(false)}>👤 My Account</Link>
                      <Link href="/account/orders" className="user-dropdown-item" onClick={() => setUserOpen(false)}>📦 My Orders</Link>
                      <Link href="/account/addresses" className="user-dropdown-item" onClick={() => setUserOpen(false)}>📍 Addresses</Link>
                      <div className="user-dropdown-divider" />
                      <button onClick={handleLogout} className="user-dropdown-item user-dropdown-signout">Sign Out</button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/auth/login" className="kp-act" aria-label="Login or sign up">
                  <UserIcon /><span className="kp-act-label">Login / Signup</span>
                </Link>
              )}
            </li>
            <li className="kp-act-li kp-act-wish">
              <Link href="/wishlist" className="kp-act" aria-label={`Wishlist (${wishCount} items)`}>
                <span className="kp-act-icon"><HeartIcon />{wishCount > 0 && <span className="cart-nav-badge">{wishCount}</span>}</span>
                <span className="kp-act-label">Wishlist</span>
              </Link>
            </li>
            <li className="kp-act-li">
              <button onClick={() => setCartOpen(true)} className={`kp-act${cartBump ? ' kp-act--bump' : ''}`} aria-label={`Cart (${count} items)`}>
                <span className="kp-act-icon"><CartIcon />{count > 0 && <span className="cart-nav-badge">{count > 99 ? '99+' : count}</span>}</span>
                <span className="kp-act-label">Cart</span>
              </button>
            </li>
          </ul>

          {/* Mobile-only account + cart (top row) */}
          <div className="kp-m-actions">
            <Link href={user ? '/account' : '/auth/login'} className="kp-m-btn" aria-label={user ? 'My account' : 'Login or sign up'}>
              {user ? <span className="user-avatar">{initials}</span> : <UserIcon size={22} />}
            </Link>
            <button onClick={() => setCartOpen(true)} className={`kp-m-btn${cartBump ? ' kp-act--bump' : ''}`} aria-label={`Cart (${count} items)`}>
              <CartIcon />{count > 0 && <span className="cart-nav-badge">{count > 99 ? '99+' : count}</span>}
            </button>
          </div>
        </div>

        {/* Mobile rows: search + delivery location */}
        <div className="kp-m-search"><NavSearch /></div>
        <div className="kp-m-loc"><DeliverTo variant="mobile" /></div>

        {/* 3 — Category navigation (desktop) */}
        <div className="kp-navrow" onMouseLeave={() => setMega(null)}>
          <div className="kp-navrow-in">
            {groups.map(g => (
              <Link key={g.label} href={g.href}
                className={`kp-cat-link${mega === g.label ? ' kp-cat-link--open' : ''}`}
                onMouseEnter={() => setMega(g.hasPanel ? g.label : null)}
                onFocus={() => setMega(g.hasPanel ? g.label : null)}>
                {g.label}{g.hasPanel && <span className="kp-cat-caret" aria-hidden="true">▾</span>}
              </Link>
            ))}
            <Link href="/brands"
              className={`kp-cat-link${mega === 'Brands' ? ' kp-cat-link--open' : ''}${pathname.startsWith('/brands') ? ' kp-cat-link--active' : ''}`}
              onMouseEnter={() => setMega(brands.length ? 'Brands' : null)}
              onFocus={() => setMega(brands.length ? 'Brands' : null)}>
              Brands{brands.length > 0 && <span className="kp-cat-caret" aria-hidden="true">▾</span>}
            </Link>

            <span className="kp-navrow-spacer" />
            <Link href="/bom-quote" className={`kp-cat-link kp-cat-quote${pathname === '/bom-quote' ? ' kp-cat-link--active' : ''}`}
              onMouseEnter={() => setMega(null)}>Project Quote</Link>
            <div ref={moreRef} className="kp-cat-more" onMouseEnter={() => setMega(null)}>
              <button onClick={() => setMoreOpen(o => !o)} className={`kp-cat-link${isMoreActive ? ' kp-cat-link--active' : ''}`} aria-expanded={moreOpen}>
                More <span className="kp-cat-caret" aria-hidden="true">▾</span>
              </button>
              {moreOpen && (
                <div className="kp-dropdown">
                  {MORE.map(({ href, label }) => (
                    <Link key={href} href={href} className={`kp-dropdown-item${pathname === href ? ' kp-dropdown-item--active' : ''}`} onClick={() => setMoreOpen(false)}>{label}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mega-menu panel */}
          {mega && (activeGroup || mega === 'Brands') && (
            <div className="kp-mega" role="menu">
              <div className="kp-mega-in">
                <div className="kp-mega-head">
                  <span className="kp-mega-title">{mega === 'Brands' ? 'Shop by Brand' : mega}</span>
                  <Link href={mega === 'Brands' ? '/brands' : activeGroup!.href} className="kp-mega-all">
                    {mega === 'Brands' ? 'View all brands' : `View all ${mega}`} →
                  </Link>
                </div>
                {mega === 'Brands' ? (
                  <div className="kp-mega-brands">
                    {brands.slice(0, 18).map(b => (
                      <Link key={b.slug} href={`/brands/${b.slug}`} className="kp-mega-brand" role="menuitem">
                        {b.logo_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={b.logo_url} alt="" loading="lazy" />
                          : null}
                        <span>{b.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="kp-mega-cols">
                    {activeGroup!.panel.map((c: any) => (
                      <Link key={c.id} href={`/category/${c.slug}`} className="kp-mega-item" role="menuitem">{c.name}</Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Reserves the extra header height so pages that pad 58px for the old bar still clear it */}
      <div className="kp-nav-spacer" aria-hidden="true" />

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="kp-drawer-wrap">
          <div className="kp-drawer-overlay" onClick={() => setMenuOpen(false)} />
          <aside className="kp-drawer" aria-label="Menu">
            <div className="kp-drawer-head">
              <Logo onClick={() => setMenuOpen(false)} />
              <button className="kp-drawer-x" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
            </div>

            <div className="kp-drawer-sec">Shop by Category</div>
            {groups.map(g => (
              <div key={g.label} className="kp-dr-group">
                <div className="kp-dr-row">
                  <Link href={g.href} className="kp-dr-link" onClick={() => setMenuOpen(false)}>{g.label}</Link>
                  {g.hasPanel && (
                    <button className="kp-dr-tog" onClick={() => setDrawerSec(s => s === g.label ? null : g.label)} aria-expanded={drawerSec === g.label} aria-label={`Toggle ${g.label}`}>
                      {drawerSec === g.label ? '−' : '+'}
                    </button>
                  )}
                </div>
                {g.hasPanel && drawerSec === g.label && (
                  <div className="kp-dr-sub">
                    {g.panel.map((c: any) => (
                      <Link key={c.id} href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}>{c.name}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="kp-dr-group">
              <div className="kp-dr-row">
                <Link href="/brands" className="kp-dr-link" onClick={() => setMenuOpen(false)}>Brands</Link>
                {brands.length > 0 && (
                  <button className="kp-dr-tog" onClick={() => setDrawerSec(s => s === 'Brands' ? null : 'Brands')} aria-expanded={drawerSec === 'Brands'} aria-label="Toggle Brands">
                    {drawerSec === 'Brands' ? '−' : '+'}
                  </button>
                )}
              </div>
              {drawerSec === 'Brands' && (
                <div className="kp-dr-sub">
                  {brands.map(b => <Link key={b.slug} href={`/brands/${b.slug}`} onClick={() => setMenuOpen(false)}>{b.name}</Link>)}
                </div>
              )}
            </div>
            <Link href="/bom-quote" className="kp-dr-quote" onClick={() => setMenuOpen(false)}>Request a Project Quote</Link>

            <div className="kp-drawer-sec">More</div>
            {DRAWER_LINKS.map(l => (
              <Link key={l.href} href={l.href} className={`kp-dr-plain${pathname === l.href ? ' kp-dr-plain--active' : ''}`} onClick={() => setMenuOpen(false)}>{l.label}</Link>
            ))}

            <div className="kp-drawer-sec">Account</div>
            {user ? (
              <>
                <Link href="/account" className="kp-dr-plain" onClick={() => setMenuOpen(false)}>👤 My Account</Link>
                <Link href="/account/orders" className="kp-dr-plain" onClick={() => setMenuOpen(false)}>📦 My Orders</Link>
                <Link href="/account/addresses" className="kp-dr-plain" onClick={() => setMenuOpen(false)}>📍 Addresses</Link>
                <button onClick={handleLogout} className="kp-dr-plain kp-dr-signout">Sign Out</button>
              </>
            ) : (
              <Link href="/auth/login" className="kp-dr-cta" onClick={() => setMenuOpen(false)}>Login / Signup</Link>
            )}
          </aside>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        /* ── Shell ───────────────────────────────────────────── */
        .kp-nav, .kp-nav.kp-nav--scrolled { display:block; padding:0 !important; height:auto; }
        .kp-nav { position:fixed; top:0; left:0; right:0; z-index:500; background:#fff; border-bottom:1px solid #E5E1DC; box-shadow:0 1px 0 rgba(11,36,71,.03); transition:box-shadow .3s; }
        .kp-nav--scrolled { box-shadow:0 4px 20px rgba(11,36,71,.12); }
        .kp-nav-spacer { display:none; }

        /* ── 1 Utility strip ─────────────────────────────────── */
        .kp-strip { display:none; background:#FAF8F5; border-bottom:1px solid #E5E1DC; height:32px; overflow:hidden; transition:height .25s, border-color .25s; }
        .kp-nav--scrolled .kp-strip { height:0; border-bottom-color:transparent; }
        .kp-strip-in { max-width:1400px; margin:0 auto; height:32px; padding:0 2rem; display:flex; align-items:center; justify-content:space-between; gap:24px; font-family:'Inter',sans-serif; font-size:.72rem; color:#4B5563; }
        .kp-strip-id { white-space:nowrap; }
        .kp-strip-trust { list-style:none; display:flex; gap:22px; margin:0; padding:0; font-weight:600; color:#0B2447; }
        .kp-strip-trust li { display:flex; align-items:center; gap:5px; white-space:nowrap; }
        .kp-strip-trust svg { color:#16a34a; }
        .kp-strip-links { display:flex; gap:18px; }
        .kp-strip-links a { color:#4B5563; text-decoration:none; font-weight:600; }
        .kp-strip-links a:hover { color:#F07316; }

        /* ── 2 Main row ──────────────────────────────────────── */
        .kp-main { background:#0B2447; display:flex; align-items:center; gap:14px; height:56px; padding:0 1rem; }
        .kp-logo .l1 { color:#fff !important; }
        .kp-logo .l2 { color:#FFB27A !important; }
        .kp-logo .kp-logo-mid { fill:#fff; }
        .kp-main-dl, .kp-actions, .kp-m-search, .kp-m-loc { display:none; }
        .kp-m-actions { margin-left:auto; display:flex; align-items:center; gap:4px; }
        .kp-m-btn { position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:none; border:none; color:#fff; cursor:pointer; text-decoration:none; }
        .kp-hamburger { display:flex; background:none; border:none; cursor:pointer; padding:8px; flex-direction:column; gap:5px; }
        .kp-hamburger span { display:block; width:22px; height:2px; background:#fff; border-radius:2px; }
        .kp-main-search { display:none; }

        .kp-m-search { background:#0B2447; padding:0 1rem 10px; }
        .kp-m-loc { background:#FAF8F5; border-bottom:1px solid #E5E1DC; padding:0 1rem; height:32px; align-items:center; }
        .kp-m-loc { display:flex; }
        .kp-m-search { display:block; }
        .kp-navrow { display:none; }

        .kp-act { position:relative; display:flex; flex-direction:column; align-items:center; gap:3px; background:none; border:none; cursor:pointer; color:#fff; text-decoration:none; padding:4px 10px; font-family:'Inter',sans-serif; }
        .kp-act:hover { color:#FFB27A; }
        .kp-act-label { font-size:.7rem; font-weight:600; white-space:nowrap; }
        .kp-act-icon { position:relative; display:flex; }
        .kp-act--bump { animation:cartBump .35s cubic-bezier(.36,.07,.19,.97); }
        @keyframes cartBump { 0%{transform:scale(1)} 40%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .kp-act-li { position:relative; list-style:none; }
        .cart-nav-badge { position:absolute; top:-6px; right:-8px; background:#F07316; color:#fff; font-size:10px; font-weight:700; min-width:17px; height:17px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; font-family:'Inter',sans-serif; box-shadow:0 0 0 2px #0B2447; }
        .user-avatar { width:26px; height:26px; border-radius:50%; background:#FFF4ED; border:1.5px solid rgba(240,115,22,.6); display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; font-size:10px; font-weight:700; color:#F07316; }

        /* user dropdown + more dropdown */
        .user-dropdown { position:absolute; top:calc(100% + 8px); right:0; background:#fff; border:1px solid #E5E1DC; border-radius:8px; min-width:210px; overflow:hidden; box-shadow:0 12px 40px rgba(11,36,71,.18); z-index:700; text-align:left; }
        .user-dropdown-header { padding:12px 16px; border-bottom:1px solid #F1EEE9; }
        .user-dropdown-name { font-family:'Inter',sans-serif; font-size:.78rem; font-weight:700; color:#0B2447; margin-bottom:2px; }
        .user-dropdown-email { font-size:11px; color:#5A6E80; }
        .user-dropdown-item { display:block; width:100%; text-align:left; padding:.65rem 1rem; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; color:#5A6E80; text-decoration:none; border:none; background:none; cursor:pointer; box-sizing:border-box; }
        .user-dropdown-item:hover { background:#FFF4ED; color:#F07316; }
        .user-dropdown-divider { height:1px; background:#F1EEE9; }
        .user-dropdown-signout { color:#DC2626 !important; }
        .kp-dropdown { position:absolute; top:calc(100% + 2px); right:0; background:#fff; border:1px solid #E5E1DC; border-radius:8px; min-width:180px; overflow:hidden; box-shadow:0 12px 40px rgba(11,36,71,.14); z-index:700; }
        .kp-dropdown-item { display:block; padding:.7rem 1.1rem; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; color:#4B5563; text-decoration:none; border-bottom:1px solid #F1EEE9; }
        .kp-dropdown-item:last-child { border-bottom:none; }
        .kp-dropdown-item:hover { background:#FFF4ED; color:#F07316; }
        .kp-dropdown-item--active { color:#F07316; }

        /* ── Search ──────────────────────────────────────────── */
        .kp-search-wrap { position:relative; width:100%; }
        .kp-search-box { display:flex; background:#fff; border-radius:6px; overflow:hidden; height:42px; border:2px solid transparent; }
        .kp-search-box:focus-within { border-color:#F07316; }
        .kp-search-input { flex:1; min-width:0; border:none; outline:none; padding:0 14px; font-size:14px; color:#0B2447; font-family:'Inter',sans-serif; background:#fff; }
        .kp-search-input::placeholder { color:#9CA3AF; }
        .kp-search-btn { width:48px; border:none; background:#F07316; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .kp-search-btn:hover { background:#D9640F; }
        .kp-search-results { position:absolute; top:calc(100% + 6px); left:0; right:0; min-width:280px; background:#fff; border:1px solid #E5E1DC; border-radius:10px; z-index:800; overflow:hidden; box-shadow:0 16px 40px rgba(11,36,71,.18); }
        .kp-search-item { display:flex; align-items:center; gap:10px; padding:10px 14px; text-decoration:none; border-bottom:1px solid #F1EEE9; }
        .kp-search-item:last-child { border-bottom:none; }
        .kp-search-item:hover { background:#FFF4ED; }
        .kp-search-item-name { font-size:13px; color:#0B2447; font-weight:600; }
        .kp-search-item-cat { font-size:11px; color:#5A6E80; font-family:'Inter',sans-serif; }
        .kp-search-item-price { font-size:12px; color:#F07316; font-weight:700; margin-left:auto; white-space:nowrap; }
        .kp-search-empty { padding:14px 16px; font-size:13px; color:#9CA3AF; text-align:center; }

        /* ── Mobile drawer ───────────────────────────────────── */
        .kp-drawer-wrap { position:fixed; inset:0; z-index:700; }
        .kp-drawer-overlay { position:absolute; inset:0; background:rgba(7,15,31,.55); }
        .kp-drawer { position:absolute; top:0; left:0; bottom:0; width:88%; max-width:340px; background:#fff; overflow-y:auto; padding:0 0 24px; box-shadow:12px 0 40px rgba(7,15,31,.3); font-family:'Inter',sans-serif; }
        .kp-drawer .logo-type .l1 { color:#0B2447 !important; }
        .kp-drawer .logo-type .l2 { color:#F07316 !important; }
        .kp-drawer .kp-logo-mid { fill:#0B2447; }
        .kp-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #E5E1DC; }
        .kp-drawer-x { background:none; border:none; font-size:1.1rem; color:#6B7280; cursor:pointer; padding:6px; }
        .kp-drawer-sec { padding:16px 16px 6px; font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#9CA3AF; }
        .kp-dr-row { display:flex; align-items:center; border-bottom:1px solid #F1EEE9; }
        .kp-dr-link { flex:1; padding:13px 16px; font-size:.92rem; font-weight:600; color:#0B2447; text-decoration:none; }
        .kp-dr-tog { width:48px; height:46px; background:none; border:none; border-left:1px solid #F1EEE9; font-size:1.2rem; color:#F07316; cursor:pointer; }
        .kp-dr-sub { background:#FAF8F5; padding:4px 0; }
        .kp-dr-sub a { display:block; padding:10px 28px; font-size:.84rem; color:#4B5563; text-decoration:none; }
        .kp-dr-sub a:hover { color:#F07316; }
        .kp-dr-quote { display:block; margin:14px 16px 0; padding:13px; text-align:center; background:#F07316; color:#fff; font-weight:700; font-size:.8rem; letter-spacing:.05em; text-transform:uppercase; border-radius:6px; text-decoration:none; }
        .kp-dr-plain { display:block; width:100%; text-align:left; padding:12px 16px; font-size:.88rem; font-weight:600; color:#4B5563; text-decoration:none; border:none; border-bottom:1px solid #F1EEE9; background:none; cursor:pointer; box-sizing:border-box; font-family:'Inter',sans-serif; }
        .kp-dr-plain--active { color:#F07316; }
        .kp-dr-signout { color:#DC2626; }
        .kp-dr-cta { display:block; margin:6px 16px 0; padding:13px; text-align:center; background:#0B2447; color:#fff; font-weight:700; font-size:.8rem; letter-spacing:.05em; text-transform:uppercase; border-radius:6px; text-decoration:none; }

        /* ── Mobile spacer: rows measured 141 → 83 beyond the old 58px ── */
        @media(max-width:960px){ .kp-nav-spacer { display:block; height:83px; } }

        /* ══ Desktop ═════════════════════════════════════════════ */
        @media(min-width:961px){
          .kp-strip { display:block; }
          .kp-main { height:68px; padding:0 2rem; gap:22px; max-width:none; }
          .kp-main > .kp-hamburger, .kp-m-actions, .kp-m-search, .kp-m-loc { display:none; }
          .kp-main-dl { display:block; }
          .kp-main-search { display:block; flex:1; max-width:680px; }
          .kp-actions { display:flex; align-items:center; gap:6px; margin:0 0 0 auto; padding:0; }
          .kp-nav-spacer { display:block; height:88px; }

          /* 3 Category nav */
          .kp-navrow { display:block; position:relative; background:#fff; border-top:1px solid #E5E1DC; }
          .kp-navrow-in { max-width:1400px; margin:0 auto; padding:0 2rem; height:44px; display:flex; align-items:center; gap:2px; }
          .kp-navrow-spacer { flex:1; }
          .kp-cat-link { height:44px; display:flex; align-items:center; gap:4px; padding:0 16px; font-family:'Inter',sans-serif; font-size:.86rem; font-weight:600; color:#0B2447; text-decoration:none; background:none; border:none; border-bottom:3px solid transparent; cursor:pointer; white-space:nowrap; }
          .kp-cat-link:hover, .kp-cat-link--open { color:#F07316; border-bottom-color:#F07316; }
          .kp-cat-link--active { border-bottom-color:#F07316; }
          .kp-cat-caret { font-size:.6rem; opacity:.7; }
          .kp-cat-quote { color:#F07316; font-weight:700; }
          .kp-cat-more { position:relative; }

          /* Mega menu */
          .kp-mega { position:absolute; left:0; right:0; top:100%; background:#fff; border-top:1px solid #E5E1DC; box-shadow:0 18px 40px rgba(11,36,71,.16); z-index:650; }
          .kp-mega-in { max-width:1400px; margin:0 auto; padding:22px 2rem 26px; }
          .kp-mega-head { display:flex; align-items:baseline; justify-content:space-between; padding-bottom:12px; margin-bottom:14px; border-bottom:1px solid #F1EEE9; }
          .kp-mega-title { font-family:'Syne','Inter',sans-serif; font-size:1.1rem; font-weight:700; color:#0B2447; }
          .kp-mega-all { font-family:'Inter',sans-serif; font-size:.78rem; font-weight:700; color:#F07316; text-decoration:none; }
          .kp-mega-cols { display:grid; grid-template-columns:repeat(4,1fr); gap:4px 24px; }
          .kp-mega-item { padding:9px 10px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.86rem; font-weight:500; color:#374151; text-decoration:none; }
          .kp-mega-item:hover { background:#FFF4ED; color:#F07316; }
          .kp-mega-brands { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
          .kp-mega-brand { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; height:84px; border:1px solid #E5E1DC; border-radius:10px; text-decoration:none; font-family:'Inter',sans-serif; font-size:.74rem; font-weight:600; color:#0B2447; padding:8px; text-align:center; }
          .kp-mega-brand img { max-height:36px; max-width:100%; object-fit:contain; }
          .kp-mega-brand:hover { border-color:#F07316; color:#F07316; }
        }
        @media(min-width:961px) and (max-width:1180px){
          .kp-strip-id { display:none; }
          .kp-main { gap:14px; padding:0 1.25rem; }
          .kp-act-wish { display:none; }
          .kp-mega-cols { grid-template-columns:repeat(3,1fr); }
        }
        @media(max-width:480px){ .kp-logo .logo-type .l1 { font-size:.95rem !important; } }
      `}</style>
    </>
  );
}

// ── NavSearch (existing /api/products search; live suggestions + Enter / button → /products?search=) ──
function NavSearch() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);
  const router                = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=6`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data.slice(0, 6) : []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  const submit = () => {
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setOpen(false); setQuery('');
  };

  return (
    <div className="kp-search-wrap" ref={ref}>
      <div className="kp-search-box">
        <input
          className="kp-search-input"
          type="search" placeholder="Search for products or brands"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search products"
        />
        <button type="button" className="kp-search-btn" onClick={submit} aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>

      {open && (
        <div className="kp-search-results">
          {loading ? (
            <div className="kp-search-empty">Searching…</div>
          ) : results.length === 0 ? (
            <div className="kp-search-empty">No products found for &ldquo;{query}&rdquo;</div>
          ) : (
            results.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className="kp-search-item" onClick={() => { setOpen(false); setQuery(''); }}>
                <div>
                  <div className="kp-search-item-name">{p.name}</div>
                  <div className="kp-search-item-cat">{p.categories?.name || p.category}</div>
                </div>
                {p.price && <span className="kp-search-item-price">₹{p.price.toLocaleString('en-IN')}</span>}
              </Link>
            ))
          )}
          {results.length > 0 && (
            <Link href={`/products?search=${encodeURIComponent(query)}`} className="kp-search-item"
              style={{ justifyContent: 'center', color: '#F97316', fontSize: 12, fontWeight: 700 }}
              onClick={() => { setOpen(false); setQuery(''); }}>
              See all results for &ldquo;{query}&rdquo; →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

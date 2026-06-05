'use client';
// src/components/Navbar.tsx — with auth state + cart
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';
import { useCart } from '@/lib/CartContext';
import CartDrawer from './CartDrawer';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

const PRIMARY = [
  { href: '/',         label: 'Home'    },
  { href: '/products', label: 'Shop'    },
  { href: '/contact',  label: 'Contact' },
];
const MORE = [
  { href: '/blog',       label: 'Blog'       },
  { href: '/bom-quote',  label: 'BOM Quote'  },
  { href: '/carpenters', label: 'Carpenters' },
];
const ALL_LINKS = [...PRIMARY, ...MORE];

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const { count } = useCart();

  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [moreOpen,   setMoreOpen]   = useState(false);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [cartBump,   setCartBump]   = useState(false);
  const [user,       setUser]       = useState<any>(null);
  const [customer,   setCustomer]   = useState<any>(null);

  const moreRef = useRef<HTMLLIElement>(null);
  const userRef = useRef<HTMLLIElement>(null);
  const prevCount = useRef(count);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cart bump animation
  useEffect(() => {
    if (count > prevCount.current) {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
    }
    prevCount.current = count;
  }, [count]);

  // Auth state
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
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserOpen(false);
    router.push('/');
    router.refresh();
  };

  if (pathname.startsWith('/admin')) return null;

  const isMoreActive = MORE.some(l => pathname === l.href);
  const initials = customer?.full_name
    ? customer.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <nav className={`kp-nav${scrolled ? ' kp-nav--scrolled' : ''}`}>

        {/* Logo */}
        <Link href="/" className="logo-wrap" style={{ gap: '.55rem' }}>
          <svg width="28" height="28" viewBox="0 0 34 34" fill="none" style={{ flexShrink: 0 }}>
            <rect x="3" y="22" width="28" height="5" rx="1" fill="#F97316" opacity=".95"/>
            <rect x="3" y="15" width="28" height="5" rx="1" fill="#F8F9FB" opacity=".55"/>
            <rect x="3" y="8"  width="28" height="5" rx="1" fill="#F97316" opacity=".65"/>
            <rect x="28" y="8" width="3"  height="19" rx="1" fill="rgba(0,0,0,0.3)"/>
          </svg>
          <div className="logo-type">
            <span className="l1" style={{ fontSize:'1.1rem' }}>KARUR PLYWOOD</span>
            <span className="l2" style={{ fontSize:'.42rem' }}>&amp; Company · Online Store</span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="kp-nav-links">
          {PRIMARY.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`kp-nav-link${pathname === href ? ' kp-nav-link--active' : ''}`}>
                {label}
              </Link>
            </li>
          ))}

          {/* More */}
          <li ref={moreRef} style={{ position: 'relative' }}>
            <button onClick={() => setMoreOpen(o => !o)}
              className={`kp-nav-link kp-more-btn${isMoreActive ? ' kp-nav-link--active' : ''}`}
              aria-expanded={moreOpen}>
              More
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
                style={{ marginLeft: 3, transition: 'transform .2s', transform: moreOpen ? 'rotate(180deg)' : 'none' }}>
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </button>
            {moreOpen && (
              <div className="kp-dropdown">
                {MORE.map(({ href, label }) => (
                  <Link key={href} href={href}
                    className={`kp-dropdown-item${pathname === href ? ' kp-dropdown-item--active' : ''}`}
                    onClick={() => setMoreOpen(false)}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Cart */}
          <li>
            <button onClick={() => setCartOpen(true)}
              className={`cart-nav-btn${cartBump ? ' cart-nav-btn--bump' : ''}`}
              aria-label={`Cart (${count} items)`}>
              <CartIcon />
              {count > 0 && <span className="cart-nav-badge">{count > 99 ? '99+' : count}</span>}
            </button>
          </li>

          {/* User account */}
          <li ref={userRef} style={{ position: 'relative' }}>
            {user ? (
              <>
                <button onClick={() => setUserOpen(o => !o)} className="user-nav-btn" aria-expanded={userOpen}>
                  <div className="user-avatar">{initials}</div>
                </button>
                {userOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{customer?.full_name || user.email}</div>
                      <div className="user-dropdown-email">{user.email}</div>
                    </div>
                    <Link href="/account" className="user-dropdown-item" onClick={() => setUserOpen(false)}>
                      👤 My Account
                    </Link>
                    <Link href="/account/orders" className="user-dropdown-item" onClick={() => setUserOpen(false)}>
                      📦 My Orders
                    </Link>
                    <Link href="/account/addresses" className="user-dropdown-item" onClick={() => setUserOpen(false)}>
                      📍 Addresses
                    </Link>
                    <div className="user-dropdown-divider" />
                    <button onClick={handleLogout} className="user-dropdown-item user-dropdown-signout">
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/auth/login" className="kp-nav-cta" style={{ display:'flex', alignItems:'center', gap:6 }}>
                <UserIcon /> Sign In
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile: cart + hamburger */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={() => setCartOpen(true)}
            className={`cart-nav-btn cart-nav-btn--mobile${cartBump ? ' cart-nav-btn--bump' : ''}`}>
            <CartIcon />
            {count > 0 && <span className="cart-nav-badge">{count}</span>}
          </button>
          <button className="kp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="kp-mobile-menu">
          {ALL_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className={`kp-mobile-link${pathname === href ? ' kp-mobile-link--active' : ''}`}>
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/account" className="kp-mobile-link" onClick={() => setMenuOpen(false)}>👤 My Account</Link>
              <Link href="/account/orders" className="kp-mobile-link" onClick={() => setMenuOpen(false)}>📦 My Orders</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="kp-mobile-link" style={{ textAlign:'left', background:'none', border:'none', cursor:'pointer', color:'#F87171', width:'100%', fontFamily:"'Syne',sans-serif", fontSize:'.82rem', fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', padding:'.8rem .5rem', borderBottom:'1px solid rgba(249,115,22,0.07)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="kp-mobile-cta" onClick={() => setMenuOpen(false)}>
              Sign In / Register
            </Link>
          )}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        .kp-nav { position:fixed; top:0; left:0; right:0; z-index:500; display:flex; justify-content:space-between; align-items:center; padding:.7rem 4rem; background:rgba(7,15,31,0.82); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-bottom:1px solid rgba(249,115,22,0.12); transition:padding .3s,background .3s; height:58px; }
        .kp-nav--scrolled { padding:.55rem 4rem; background:rgba(7,15,31,0.97); height:52px; box-shadow:0 2px 20px rgba(0,0,0,0.3); }
        .kp-nav-links { display:flex; gap:1.4rem; list-style:none; align-items:center; }
        .kp-nav-link { font-family:'Syne',sans-serif; font-size:.7rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#7A8EA8; text-decoration:none; padding-bottom:3px; border-bottom:2px solid transparent; transition:color .2s,border-color .2s; white-space:nowrap; }
        .kp-nav-link:hover { color:#F8F9FB; border-bottom-color:rgba(249,115,22,0.4); }
        .kp-nav-link--active { color:#F8F9FB; border-bottom-color:#F97316; }
        .kp-more-btn { background:none; border:none; cursor:pointer; display:flex; align-items:center; padding-bottom:3px; }
        .kp-dropdown { position:absolute; top:calc(100% + 12px); right:0; background:rgba(7,15,31,0.98); border:1px solid rgba(249,115,22,0.18); border-radius:6px; min-width:160px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.5); animation:ddFade .15s ease; z-index:600; }
        @keyframes ddFade { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .kp-dropdown-item { display:block; padding:.7rem 1.1rem; font-family:'Syne',sans-serif; font-size:.7rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#7A8EA8; text-decoration:none; border-bottom:1px solid rgba(249,115,22,0.07); transition:background .15s,color .15s; }
        .kp-dropdown-item:last-child { border-bottom:none; }
        .kp-dropdown-item:hover { background:rgba(249,115,22,0.08); color:#F97316; }
        .kp-dropdown-item--active { color:#F97316; }
        .kp-nav-cta { font-family:'Syne',sans-serif; background:#F97316; color:#0B2447; padding:.38rem 1rem; border-radius:4px; font-weight:700; font-size:.68rem; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; transition:background .2s,transform .2s; white-space:nowrap; display:inline-flex; align-items:center; gap:5px; }
        .kp-nav-cta:hover { background:#FF9A45; transform:translateY(-1px); }
        .cart-nav-btn { position:relative; background:rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.2); border-radius:6px; color:#F97316; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
        .cart-nav-btn:hover { background:rgba(249,115,22,0.15); border-color:#F97316; }
        .cart-nav-btn--mobile { display:none; }
        .cart-nav-btn--bump { animation:cartBump .35s cubic-bezier(.36,.07,.19,.97); }
        @keyframes cartBump { 0%{transform:scale(1)} 40%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .cart-nav-badge { position:absolute; top:-6px; right:-6px; background:#F97316; color:#0B2447; font-size:9px; font-weight:700; min-width:16px; height:16px; border-radius:8px; display:flex; align-items:center; justify-content:center; padding:0 3px; font-family:'Syne',sans-serif; border:1.5px solid #070F1F; }

        /* User button */
        .user-nav-btn { background:none; border:none; cursor:pointer; padding:0; }
        .user-avatar { width:32px; height:32px; border-radius:50%; background:rgba(249,115,22,0.15); border:1.5px solid rgba(249,115,22,0.4); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:11px; font-weight:700; color:#F97316; transition:all .2s; }
        .user-nav-btn:hover .user-avatar { background:rgba(249,115,22,0.25); border-color:#F97316; }

        /* User dropdown */
        .user-dropdown { position:absolute; top:calc(100% + 12px); right:0; background:rgba(7,15,31,0.98); border:1px solid rgba(249,115,22,0.18); border-radius:8px; min-width:200px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.5); animation:ddFade .15s ease; z-index:600; }
        .user-dropdown-header { padding:12px 16px; border-bottom:1px solid rgba(249,115,22,0.08); }
        .user-dropdown-name { font-family:'Syne',sans-serif; font-size:.78rem; font-weight:700; color:#F8F9FB; margin-bottom:2px; }
        .user-dropdown-email { font-size:11px; color:#7A8EA8; }
        .user-dropdown-item { display:block; width:100%; text-align:left; padding:.65rem 1rem; font-family:'Syne',sans-serif; font-size:.68rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#7A8EA8; text-decoration:none; border:none; background:none; cursor:pointer; border-bottom:1px solid rgba(249,115,22,0.05); transition:background .15s,color .15s; }
        .user-dropdown-item:hover { background:rgba(249,115,22,0.07); color:#F97316; }
        .user-dropdown-divider { height:1px; background:rgba(249,115,22,0.1); }
        .user-dropdown-signout { color:#F87171 !important; }
        .user-dropdown-signout:hover { background:rgba(248,113,113,0.08) !important; }

        .kp-hamburger { display:none; background:none; border:none; cursor:pointer; padding:4px; flex-direction:column; gap:5px; }
        .kp-hamburger span { display:block; width:22px; height:2px; background:#F8F9FB; border-radius:2px; transition:all .3s; }
        .kp-mobile-menu { position:fixed; top:58px; left:0; right:0; z-index:499; background:rgba(7,15,31,0.98); border-bottom:1px solid rgba(249,115,22,0.15); padding:.5rem 1.5rem 1.25rem; display:flex; flex-direction:column; animation:ddFade .2s ease; }
        .kp-mobile-link { padding:.8rem .5rem; font-family:'Syne',sans-serif; font-size:.82rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#7A8EA8; border-bottom:1px solid rgba(249,115,22,0.07); text-decoration:none; transition:color .2s; }
        .kp-mobile-link:hover,.kp-mobile-link--active { color:#F97316; }
        .kp-mobile-cta { margin-top:14px; padding:.85rem; text-align:center; background:#F97316; color:#0B2447; font-family:'Syne',sans-serif; font-weight:700; font-size:.8rem; letter-spacing:.08em; text-transform:uppercase; border-radius:4px; text-decoration:none; display:block; }

        @media(max-width:960px){
          .kp-nav { padding:0 1.25rem !important; }
          .kp-nav-links { display:none !important; }
          .kp-hamburger { display:flex !important; }
          .cart-nav-btn--mobile { display:flex !important; }
        }
        @media(max-width:480px){ .logo-type .l1 { font-size:.95rem !important; } }
      `}</style>
    </>
  );
}

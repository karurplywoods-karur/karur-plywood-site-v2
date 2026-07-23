'use client';
// src/app/auth/login/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/account');
    router.refresh();
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="log-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>Login</span>
        </div>

        <div className="log-layout">
          {/* Left image + copy */}
          <div className="log-hero">
            <Image src="/images/about-showroom.jpg" alt="" fill style={{ objectFit: 'cover' }} />
            <div className="log-hero-overlay">
              <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.6rem,2.6vw,2rem)', fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>Welcome Back!</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 8, fontWeight: 600 }}>Sign in to your Karur Plywood account</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>Access your orders, wishlist, exclusive offers and more.</p>
            </div>
          </div>

          {/* Form */}
          <div className="log-card">
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#0B2447', marginBottom: 4 }}>Login</h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 22 }}>Enter your details to continue</p>
            {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <form onSubmit={handleEmail}>
              <div style={{ marginBottom: 16 }}>
                <label className="log-lbl">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email address" className="log-inp" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="log-lbl" style={{ marginBottom: 0 }}>Password</label>
                  <Link href="/auth/forgot-password" style={{ fontSize: 11.5, color: '#F07316', fontFamily: "'Inter',sans-serif", fontWeight: 700, textDecoration: 'none' }}>Forgot Password?</Link>
                </div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="log-inp" />
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: '#4B5563', marginBottom: 20, cursor: 'pointer' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button type="submit" disabled={loading} className="log-submit-btn">{loading ? '⏳ Signing in...' : 'Sign In'}</button>
            </form>

            <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9CA3AF', margin: '18px 0' }}>New to Karur Plywood?</div>
            <Link href="/auth/register" style={{ display: 'block', textAlign: 'center', padding: '12px 0', border: '1px solid #E5E1DC', borderRadius: 6, color: '#0B2447', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Create New Account</Link>
          </div>

          {/* Right — social login */}
          <aside className="log-social-card">
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 16 }}>Login With</div>
            <button onClick={handleGoogle} disabled={loading} className="log-social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, padding: '12px 14px', background: '#FAF8F5', borderRadius: 8 }}>
              <span style={{ fontSize: 16 }}>🛡️</span>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, color: '#0B2447' }}>Your data is safe with us</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>We use industry-standard security measures to protect your information.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .log-layout { display: grid; grid-template-columns: 1fr 400px 240px; gap: 24px; align-items: stretch; }
        .log-hero { position: relative; border-radius: 14px; overflow: hidden; min-height: 420px; display: flex; align-items: flex-end; }
        .log-hero-overlay { position: relative; z-index: 2; padding: 28px; background: linear-gradient(0deg, rgba(11,36,71,0.75) 0%, rgba(11,36,71,0.1) 70%); width: 100%; }
        .log-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 14px; padding: 32px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .log-social-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 14px; padding: 24px; height: max-content; }
        .log-lbl { display: block; font-family: 'Inter',sans-serif; font-size: .68rem; font-weight: 700; color: #0B2447; margin-bottom: 6px; }
        .log-inp { width: 100%; padding: 11px 13px; border: 1px solid #E5E1DC; border-radius: 6px; font-size: 14px; color: #0B2447; background: #FAF8F5; outline: none; box-sizing: border-box; }
        .log-inp:focus { border-color: #F07316; background: #FFFFFF; }
        .log-submit-btn { width: 100%; padding: 13px 0; background: #F07316; color: #FFFFFF; border: none; border-radius: 6px; font-family: 'Inter',sans-serif; font-weight: 700; font-size: .82rem; letter-spacing: .04em; cursor: pointer; }
        .log-submit-btn:hover:not(:disabled) { background: #D9640F; }
        .log-submit-btn:disabled { opacity: .6; cursor: not-allowed; }
        .log-social-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 11px 0; border: 1px solid #E5E1DC; border-radius: 6px; background: #FFFFFF; color: #0B2447; font-family: 'Inter',sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; }
        .log-social-btn:hover:not(:disabled) { border-color: #0B2447; }
        @media(max-width:1100px){ .log-layout { grid-template-columns: 1fr; } .log-hero { display: none; } }
        @media(max-width:640px){ .log-pad { padding-left:16px !important; padding-right:16px !important; } .log-card { padding: 22px; } }
      `}</style>
    </div>
  );
}

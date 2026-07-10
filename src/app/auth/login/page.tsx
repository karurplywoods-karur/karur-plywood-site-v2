'use client';
// src/app/auth/login/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const inp = `auth-inp`;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">🪵</div>
          <div className="auth-logo-text">KARUR PLYWOOD</div>
          <div className="auth-logo-sub">& Company</div>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your account to view orders and checkout faster.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleEmail} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="auth-inp"
            />
          </div>
          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label">Password</label>
              <Link href="/auth/forgot-password" className="auth-forgot">Forgot password?</Link>
            </div>
            <input
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-inp"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button onClick={handleGoogle} disabled={loading} className="auth-btn-google">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="auth-switch">
          New to Karur Plywood?{' '}
          <Link href="/auth/register" className="auth-link">Create an account</Link>
        </p>
      </div>

      <AuthStyles />
    </div>
  );
}

function AuthStyles() {
  return (
    <style>{`
      .auth-page {
        min-height: 100vh;
        background: linear-gradient(160deg, #040d1a 0%, #070F1F 100%);
        display: flex; align-items: center; justify-content: center;
        padding: 80px 20px 40px;
      }
      .auth-card {
        width: 100%; max-width: 420px;
        background: rgba(25,55,109,0.25);
        border: 1px solid rgba(249,115,22,0.18);
        border-radius: 14px;
        padding: 40px 36px;
      }
      .auth-logo { text-align: center; margin-bottom: 28px; }
      .auth-logo-mark { font-size: 36px; margin-bottom: 6px; }
      .auth-logo-text { font-family: 'Bebas Neue',sans-serif; font-size: 1.4rem; letter-spacing: .12em; color: #F8F9FB; }
      .auth-logo-sub { font-size: 11px; color: #F97316; letter-spacing: .2em; text-transform: uppercase; }
      .auth-title { font-family: 'Syne',sans-serif; font-size: 1.4rem; font-weight: 700; color: #F8F9FB; text-align: center; margin-bottom: 6px; }
      .auth-sub { font-size: 13px; color: #7A8EA8; text-align: center; margin-bottom: 24px; line-height: 1.6; }
      .auth-error { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); border-radius: 6px; padding: 10px 14px; font-size: 13px; color: #FCA5A5; margin-bottom: 16px; }
      .auth-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
      .auth-field { display: flex; flex-direction: column; gap: 6px; }
      .auth-label { font-family: 'Syne',sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #7A8EA8; }
      .auth-label-row { display: flex; justify-content: space-between; align-items: center; }
      .auth-forgot { font-size: 11px; color: #F97316; text-decoration: none; font-family: 'Syne',sans-serif; font-weight: 600; }
      .auth-forgot:hover { text-decoration: underline; }
      .auth-inp {
        background: rgba(7,15,31,0.6);
        border: 1px solid rgba(249,115,22,0.18);
        border-radius: 6px; padding: 11px 14px;
        font-size: 14px; color: #F8F9FB;
        font-family: 'DM Sans',sans-serif; outline: none;
        transition: border-color 0.2s;
        width: 100%;
      }
      .auth-inp:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
      .auth-inp::placeholder { color: #7A8EA8; }
      .auth-btn-primary {
        width: 100%; padding: 13px 0;
        background: #F97316; color: #0B2447;
        border: none; border-radius: 6px;
        font-family: 'Syne',sans-serif; font-weight: 700;
        font-size: 0.82rem; letter-spacing: .1em; text-transform: uppercase;
        cursor: pointer; transition: all 0.2s;
      }
      .auth-btn-primary:hover:not(:disabled) { background: #FF9A45; transform: translateY(-1px); }
      .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      .auth-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: #7A8EA8; font-size: 12px; }
      .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(249,115,22,0.12); }
      .auth-btn-google {
        width: 100%; padding: 12px 0;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 6px; color: #F8F9FB;
        font-family: 'Syne',sans-serif; font-weight: 600;
        font-size: 0.78rem; letter-spacing: .06em;
        cursor: pointer; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center; gap: 10px;
        margin-bottom: 20px;
      }
      .auth-btn-google:hover:not(:disabled) { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); }
      .auth-switch { text-align: center; font-size: 13px; color: #7A8EA8; }
      .auth-link { color: #F97316; text-decoration: none; font-weight: 600; }
      .auth-link:hover { text-decoration: underline; }
    `}</style>
  );
}

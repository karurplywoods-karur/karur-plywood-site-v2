'use client';
// src/app/auth/register/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) { setError(error.message); setLoading(false); return; }

    // Update phone in customers table
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch('/api/customer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: form.full_name, phone: form.phone }),
      });
      router.push('/account');
      router.refresh();
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (done) return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>ðŸ“§</div>
        <h2 className="auth-title">Check your email</h2>
        <p className="auth-sub">We sent a confirmation link to <strong style={{ color: '#F97316' }}>{form.email}</strong>. Click it to activate your account.</p>
        <Link href="/auth/login" className="auth-btn-primary" style={{ display: 'block', marginTop: 20, textDecoration: 'none', textAlign: 'center', padding: '13px 0' }}>Back to Login</Link>
      </div>
      <style>{authStyles}</style>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">ðŸªµ</div>
          <div className="auth-logo-text">KARUR PLYWOOD</div>
          <div className="auth-logo-sub">& Company</div>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join to track orders and checkout faster.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input className="auth-inp" type="text" required placeholder="Rajan Kumar"
              value={form.full_name} onChange={e => set('full_name', e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input className="auth-inp" type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Phone Number</label>
            <input className="auth-inp" type="tel" required placeholder="+91 98765 43210"
              value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-inp" type="password" required placeholder="Min. 6 characters"
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input className="auth-inp" type="password" required placeholder="Re-enter password"
              value={form.confirm} onChange={e => set('confirm', e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? 'â³ Creating account...' : 'Create Account'}
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

        <p className="auth-switch">Already have an account?{' '}
          <Link href="/auth/login" className="auth-link">Sign in</Link>
        </p>
      </div>
      <style>{authStyles}</style>
    </div>
  );
}

const authStyles = `
  .auth-page { min-height:100vh; background:linear-gradient(160deg,#040d1a 0%,#070F1F 100%); display:flex; align-items:center; justify-content:center; padding:80px 20px 40px; }
  .auth-card { width:100%; max-width:420px; background:rgba(25,55,109,0.25); border:1px solid rgba(249,115,22,0.18); border-radius:14px; padding:40px 36px; }
  .auth-logo { text-align:center; margin-bottom:24px; }
  .auth-logo-mark { font-size:32px; margin-bottom:4px; }
  .auth-logo-text { font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:.12em; color:#F8F9FB; }
  .auth-logo-sub { font-size:10px; color:#F97316; letter-spacing:.2em; text-transform:uppercase; }
  .auth-title { font-family:'Syne',sans-serif; font-size:1.3rem; font-weight:700; color:#F8F9FB; text-align:center; margin-bottom:6px; }
  .auth-sub { font-size:13px; color:#7A8EA8; text-align:center; margin-bottom:20px; line-height:1.6; }
  .auth-error { background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.3); border-radius:6px; padding:10px 14px; font-size:13px; color:#FCA5A5; margin-bottom:16px; }
  .auth-form { display:flex; flex-direction:column; gap:14px; margin-bottom:16px; }
  .auth-field { display:flex; flex-direction:column; gap:5px; }
  .auth-label { font-family:'Syne',sans-serif; font-size:0.6rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#7A8EA8; }
  .auth-label-row { display:flex; justify-content:space-between; align-items:center; }
  .auth-forgot { font-size:11px; color:#F97316; text-decoration:none; font-family:'Syne',sans-serif; font-weight:600; }
  .auth-inp { background:rgba(7,15,31,0.6); border:1px solid rgba(249,115,22,0.18); border-radius:6px; padding:10px 13px; font-size:14px; color:#F8F9FB; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; width:100%; }
  .auth-inp:focus { border-color:#F97316; box-shadow:0 0 0 3px rgba(249,115,22,0.1); }
  .auth-inp::placeholder { color:#7A8EA8; }
  .auth-btn-primary { width:100%; padding:12px 0; background:#F97316; color:#0B2447; border:none; border-radius:6px; font-family:'Syne',sans-serif; font-weight:700; font-size:0.8rem; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
  .auth-btn-primary:hover:not(:disabled) { background:#FF9A45; transform:translateY(-1px); }
  .auth-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
  .auth-divider { display:flex; align-items:center; gap:12px; margin:14px 0; color:#7A8EA8; font-size:12px; }
  .auth-divider::before,.auth-divider::after { content:''; flex:1; height:1px; background:rgba(249,115,22,0.12); }
  .auth-btn-google { width:100%; padding:11px 0; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#F8F9FB; font-family:'Syne',sans-serif; font-weight:600; font-size:0.75rem; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:18px; }
  .auth-btn-google:hover:not(:disabled) { background:rgba(255,255,255,0.09); }
  .auth-switch { text-align:center; font-size:13px; color:#7A8EA8; }
  .auth-link { color:#F97316; text-decoration:none; font-weight:600; }
`;


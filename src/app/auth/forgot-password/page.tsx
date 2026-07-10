'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true); setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">🪵</div>
          <div className="auth-logo-text">KARUR PLYWOOD</div>
        </div>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📧</div>
            <h2 className="auth-title">Check your email</h2>
            <p className="auth-sub">We sent a password reset link to <strong style={{ color: '#F97316' }}>{email}</strong></p>
            <Link href="/auth/login" style={{ display: 'block', marginTop: 20, color: '#F97316', fontSize: 13, textAlign: 'center' }}>← Back to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Forgot Password</h1>
            <p className="auth-sub">Enter your email and we'll send you a reset link.</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input className="auth-inp" type="email" required placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="auth-btn-primary">
                {loading ? '⏳ Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-switch"><Link href="/auth/login" className="auth-link">← Back to Login</Link></p>
          </>
        )}
      </div>
      <style>{`
        .auth-page{min-height:100vh;background:linear-gradient(160deg,#040d1a,#070F1F);display:flex;align-items:center;justify-content:center;padding:80px 20px}
        .auth-card{width:100%;max-width:420px;background:rgba(25,55,109,0.25);border:1px solid rgba(249,115,22,0.18);border-radius:14px;padding:40px 36px}
        .auth-logo{text-align:center;margin-bottom:24px}
        .auth-logo-mark{font-size:32px;margin-bottom:4px}
        .auth-logo-text{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:.12em;color:#F8F9FB}
        .auth-title{font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:700;color:#F8F9FB;text-align:center;margin-bottom:6px}
        .auth-sub{font-size:13px;color:#7A8EA8;text-align:center;margin-bottom:20px;line-height:1.6}
        .auth-error{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:6px;padding:10px 14px;font-size:13px;color:#FCA5A5;margin-bottom:16px}
        .auth-form{display:flex;flex-direction:column;gap:14px;margin-bottom:16px}
        .auth-field{display:flex;flex-direction:column;gap:5px}
        .auth-label{font-family:'Syne',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#7A8EA8}
        .auth-inp{background:rgba(7,15,31,0.6);border:1px solid rgba(249,115,22,0.18);border-radius:6px;padding:10px 13px;font-size:14px;color:#F8F9FB;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.2s;width:100%}
        .auth-inp:focus{border-color:#F97316;box-shadow:0 0 0 3px rgba(249,115,22,0.1)}
        .auth-inp::placeholder{color:#7A8EA8}
        .auth-btn-primary{width:100%;padding:12px 0;background:#F97316;color:#0B2447;border:none;border-radius:6px;font-family:'Syne',sans-serif;font-weight:700;font-size:0.8rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
        .auth-btn-primary:hover:not(:disabled){background:#FF9A45;transform:translateY(-1px)}
        .auth-btn-primary:disabled{opacity:0.6;cursor:not-allowed}
        .auth-switch{text-align:center;font-size:13px;color:#7A8EA8}
        .auth-link{color:#F97316;text-decoration:none;font-weight:600}
      `}</style>
    </div>
  );
}

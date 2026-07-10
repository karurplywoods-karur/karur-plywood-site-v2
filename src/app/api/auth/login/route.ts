// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

// In-memory brute-force protection. Resets on cold start/redeploy â€” fine for
// a single small admin login endpoint; not meant as a distributed rate limiter.
const attempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const record = attempts.get(ip);

    if (record && now - record.firstAttempt < WINDOW_MS) {
      if (record.count >= MAX_ATTEMPTS) {
        const retryAfterSec = Math.ceil((WINDOW_MS - (now - record.firstAttempt)) / 1000);
        return NextResponse.json(
          { error: `Too many attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.` },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
        );
      }
    } else {
      attempts.set(ip, { count: 0, firstAttempt: now });
    }

    const { password } = await req.json();
    const correct = process.env.ADMIN_PASSWORD || 'karurplywood2025';

    if (password !== correct) {
      const current = attempts.get(ip)!;
      current.count += 1;
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Successful login clears this IP's attempt count.
    attempts.delete(ip);

    const token = await createToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

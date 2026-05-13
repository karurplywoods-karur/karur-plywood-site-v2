// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correct = process.env.ADMIN_PASSWORD || 'karurplywood2025';

    if (password !== correct) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

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

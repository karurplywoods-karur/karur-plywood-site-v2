// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production-32chars'
);

export async function createToken() {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

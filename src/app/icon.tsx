// src/app/icon.tsx — Next.js generates /icon.png automatically
import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: 32, height: 32,
        background: '#0B2447',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: '4px',
      }}>
        {/* Top orange bar */}
        <div style={{ width: 24, height: 5, background: '#F97316', borderRadius: 1, marginBottom: 2 }} />
        {/* Middle white bar */}
        <div style={{ width: 24, height: 5, background: 'rgba(248,249,251,0.6)', borderRadius: 1, marginBottom: 2 }} />
        {/* Bottom orange bar */}
        <div style={{ width: 24, height: 5, background: 'rgba(249,115,22,0.8)', borderRadius: 1 }} />
      </div>
    ),
    { ...size }
  );
}

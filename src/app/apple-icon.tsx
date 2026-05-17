// src/app/apple-icon.tsx — generates /apple-icon.png (180×180)
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: 180, height: 180,
        background: '#0B2447',
        borderRadius: 36,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: '24px',
      }}>
        {/* Store name */}
        <div style={{
          fontFamily: 'sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3,
          color: '#F97316',
          marginBottom: 12,
          textTransform: 'uppercase',
        }}>KP</div>
        {/* Top orange bar */}
        <div style={{ width: 120, height: 22, background: '#F97316', borderRadius: 4, marginBottom: 8 }} />
        {/* Middle white bar */}
        <div style={{ width: 120, height: 22, background: 'rgba(248,249,251,0.55)', borderRadius: 4, marginBottom: 8 }} />
        {/* Bottom orange bar */}
        <div style={{ width: 120, height: 22, background: 'rgba(249,115,22,0.78)', borderRadius: 4 }} />
      </div>
    ),
    { ...size }
  );
}

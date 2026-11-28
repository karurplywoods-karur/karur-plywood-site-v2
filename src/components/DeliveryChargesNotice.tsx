'use client';
// src/components/DeliveryChargesNotice.tsx
// "Delivery Charges Extra" message shown near the order summary and right above the
// Place Order button (desktop + mobile). Text lives in lib/deliveryWorkflow.ts.
import { DELIVERY_NOTICE_TITLE, DELIVERY_NOTICE_LINES, PICKUP_NOTICE } from '@/lib/deliveryWorkflow';

export default function DeliveryChargesNotice({ pickup = false, compact = false }: { pickup?: boolean; compact?: boolean }) {
  if (pickup) {
    return (
      <div role="note" style={{
        background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10,
        padding: compact ? '10px 12px' : '12px 16px', margin: compact ? '12px 0 0' : '16px 0',
        fontFamily: "'Inter',sans-serif", fontSize: compact ? 12 : 13.5, color: '#166534', fontWeight: 600,
      }}>
        🏬 {PICKUP_NOTICE}
      </div>
    );
  }
  return (
    <div role="note" style={{
      background: '#FFF7ED', border: '1px solid #FDBA74', borderLeft: '4px solid #F07316', borderRadius: 10,
      padding: compact ? '10px 12px' : '14px 18px', margin: compact ? '12px 0 0' : '16px 0',
      fontFamily: "'Inter',sans-serif", color: '#7C2D12',
    }}>
      <div style={{ fontWeight: 800, fontSize: compact ? 12.5 : 14.5, color: '#C2410C', marginBottom: compact ? 4 : 6 }}>
        🚚 {DELIVERY_NOTICE_TITLE}
      </div>
      {(compact ? DELIVERY_NOTICE_LINES.slice(0, 2) : DELIVERY_NOTICE_LINES).map((line, i) => (
        <p key={i} style={{ margin: i === 0 ? 0 : '6px 0 0', fontSize: compact ? 11.5 : 13, lineHeight: 1.6 }}>{line}</p>
      ))}
    </div>
  );
}

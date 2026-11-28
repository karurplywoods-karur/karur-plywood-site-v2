'use client';
// src/components/DeliveryStatusCard.tsx — customer-facing delivery status for an order.
// Shows nothing for store-pickup and older orders (no delivery workflow).
import { NOT_APPLICABLE } from '@/lib/deliveryWorkflow';

export default function DeliveryStatusCard({ order }: { order: any }) {
  if (!order?.delivery_status || order.delivery_status === NOT_APPLICABLE) return null;

  const quoted = order.delivery_charge_quoted;
  const hasQuote = quoted !== null && quoted !== undefined && quoted !== '';
  const approved = order.customer_approval_status === 'Approved';
  const declined = order.customer_approval_status === 'Declined';

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, color: '#6B7280' }}>
      <span>{label}</span><span style={{ color: '#0B2447', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ marginTop: 14, background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: 10, padding: '14px 16px', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#C2410C', marginBottom: 10 }}>
        🚚 Delivery
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {row('Status', order.delivery_status)}
        {row('Transport charge', hasQuote ? `₹${Number(quoted).toLocaleString('en-IN')}` : 'To be confirmed by customer care')}
        {hasQuote && row('Your approval', approved ? 'Approved' : declined ? 'Declined' : 'Awaiting your confirmation')}
        {order.expected_delivery_date && row('Expected delivery', new Date(order.expected_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }))}
        {(order.transporter_name || order.transport_type) && row('Transport', [order.transport_type, order.transporter_name].filter(Boolean).join(' · '))}
        {order.transporter_phone && row('Transport contact', order.transporter_phone)}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 11.5, color: '#7C2D12', lineHeight: 1.6 }}>
        Delivery charges are extra and are paid directly to the transport provider on delivery. Dispatch happens after you approve the charge.
      </p>
    </div>
  );
}

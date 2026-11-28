'use client';
// src/components/OrderDeliveryPanel.tsx — admin: delivery-charge coordination for one order.
// Customer care: get the transport cost, quote it, record the customer's approval, then dispatch.
// KPC does not collect the transport money — the customer pays the transport person on delivery.
import { useEffect, useState } from 'react';
import {
  DELIVERY_STATUSES, APPROVAL_STATUSES, DELIVERY_PAYMENT_STATUSES, TRANSPORT_TYPES,
  NOT_APPLICABLE, dispatchBlockReason, PAYABLE_NOTE,
} from '@/lib/deliveryWorkflow';

const label: React.CSSProperties = { display: 'block', fontSize: 10, color: '#7A8EA8', fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 };
const input: React.CSSProperties = { width: '100%', background: 'rgba(7,15,31,0.7)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 6, padding: '8px 10px', color: '#F8F9FB', fontSize: 13, fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' };

const toStr = (v: any) => (v === null || v === undefined ? '' : String(v));

export default function OrderDeliveryPanel({ order, onSaved, showMsg }: {
  order: any;
  onSaved: () => void;
  showMsg: (msg: string, ok?: boolean) => void;
}) {
  const initial = (o: any) => ({
    delivery_status: toStr(o.delivery_status),
    transport_type: toStr(o.transport_type),
    transporter_name: toStr(o.transporter_name),
    transporter_phone: toStr(o.transporter_phone),
    actual_transport_cost: toStr(o.actual_transport_cost),
    delivery_charge_quoted: toStr(o.delivery_charge_quoted),
    customer_approval_status: toStr(o.customer_approval_status) || 'Pending',
    delivery_payment_status: toStr(o.delivery_payment_status) || 'Pay on delivery',
    delivery_payment_note: toStr(o.delivery_payment_note),
    care_remarks: toStr(o.care_remarks),
    expected_delivery_date: toStr(o.expected_delivery_date).slice(0, 10),
  });
  const [f, setF] = useState(initial(order));
  const [busy, setBusy] = useState(false);
  useEffect(() => { setF(initial(order)); /* refresh after save */ }, [order.id, order.delivery_status, order.customer_approval_status, order.delivery_charge_quoted, order.delivery_payment_status, order.care_remarks, order.expected_delivery_date, order.transporter_name]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const box: React.CSSProperties = { background: 'rgba(7,15,31,0.5)', borderRadius: 6, padding: '14px 16px', marginBottom: 20 };
  const heading = <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#F97316', marginBottom: 12 }}>🚚 Delivery Charges (extra — paid to transport provider)</div>;

  // Store pickup — nothing to do
  if (order.delivery_status === NOT_APPLICABLE || order.shipping_method === 'pickup') {
    return <div style={box}>{heading}<div style={{ fontSize: 12, color: '#7A8EA8' }}>🏬 Store pickup order — no delivery charges.</div></div>;
  }

  const call = async (payload: any, okMsg: string) => {
    setBusy(true);
    const res = await fetch('/api/orders/admin/delivery', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, ...payload }) });
    setBusy(false);
    const d = await res.json().catch(() => ({}));
    if (res.ok) { showMsg(okMsg); onSaved(); }
    else showMsg(`❌ ${d.error || 'Update failed.'}`, false);
  };

  // Older order created before this workflow existed
  if (!order.delivery_status) {
    return (
      <div style={box}>
        {heading}
        <div style={{ fontSize: 12, color: '#7A8EA8', marginBottom: 10 }}>This order was placed before the delivery workflow was introduced, so it is not gated. You can switch it on if the transport charge is still to be confirmed.</div>
        <button disabled={busy} onClick={() => call({ action: 'enable' }, '✅ Delivery workflow enabled for this order.')}
          style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316', border: '1px solid rgba(249,115,22,0.4)', borderRadius: 6, padding: '8px 16px', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          Enable delivery workflow
        </button>
      </div>
    );
  }

  const blocked = dispatchBlockReason(order, 'Dispatched');
  const save = () => call(f, '✅ Delivery details saved.');

  return (
    <div style={box}>
      {heading}

      {/* Dispatch gate indicator */}
      <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 6, fontSize: 12, fontFamily: "'Inter',sans-serif", fontWeight: 600,
        background: blocked ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)', color: blocked ? '#FCA5A5' : '#4ADE80',
        border: `1px solid ${blocked ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.3)'}` }}>
        {blocked
          ? '🔒 Dispatch blocked — quote the transport charge and record the customer’s approval first.'
          : `✅ Dispatch allowed — customer approved ₹${Number(order.delivery_charge_quoted).toLocaleString('en-IN')} (paid to transport provider on delivery).`}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div>
          <label style={label}>Delivery status</label>
          <select style={input} value={f.delivery_status} onChange={e => set('delivery_status', e.target.value)}>
            {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Transport type</label>
          <select style={input} value={f.transport_type} onChange={e => set('transport_type', e.target.value)}>
            <option value="">— select —</option>
            {TRANSPORT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Transporter name</label>
          <input style={input} value={f.transporter_name} onChange={e => set('transporter_name', e.target.value)} placeholder="Auto owner / driver" />
        </div>
        <div>
          <label style={label}>Transporter phone</label>
          <input style={input} value={f.transporter_phone} onChange={e => set('transporter_phone', e.target.value)} placeholder="Phone" inputMode="tel" />
        </div>
        <div>
          <label style={label}>Actual transport cost ₹ (internal)</label>
          <input style={input} type="number" min="0" value={f.actual_transport_cost} onChange={e => set('actual_transport_cost', e.target.value)} />
        </div>
        <div>
          <label style={label}>Charge quoted to customer ₹</label>
          <input style={input} type="number" min="0" value={f.delivery_charge_quoted} onChange={e => set('delivery_charge_quoted', e.target.value)} />
        </div>
        <div>
          <label style={label}>Customer approval</label>
          <select style={input} value={f.customer_approval_status} onChange={e => set('customer_approval_status', e.target.value)}>
            {APPROVAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Transport charge payment</label>
          <select style={input} value={f.delivery_payment_status} onChange={e => set('delivery_payment_status', e.target.value)}>
            {DELIVERY_PAYMENT_STATUSES.filter(s => s !== 'Not applicable').map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Payment note / reference (optional)</label>
          <input style={input} value={f.delivery_payment_note} onChange={e => set('delivery_payment_note', e.target.value)} placeholder="e.g. paid cash to driver" />
        </div>
        <div>
          <label style={label}>Expected delivery date</label>
          <input style={input} type="date" value={f.expected_delivery_date} onChange={e => set('expected_delivery_date', e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={label}>Customer care remarks</label>
        <textarea style={{ ...input, minHeight: 60, resize: 'vertical' }} value={f.care_remarks} onChange={e => set('care_remarks', e.target.value)} placeholder="Call notes, customer response, special instructions…" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        <button disabled={busy} onClick={save}
          style={{ background: busy ? '#5c4a2e' : 'linear-gradient(135deg,#F97316,#C2410C)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
          {busy ? '⏳ Saving…' : '✓ Save delivery details'}
        </button>
        <span style={{ fontSize: 11, color: '#7A8EA8', fontFamily: "'Inter',sans-serif" }}>
          {PAYABLE_NOTE}. Not part of the order total or the Razorpay payment.
        </span>
      </div>
    </div>
  );
}

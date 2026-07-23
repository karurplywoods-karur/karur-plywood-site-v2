'use client';
// src/app/account/orders/[id]/invoice/page.tsx
// GST-compliant tax invoice. Opens in browser → customer hits Ctrl+P / Save as PDF.
// Auto-triggers print dialog on load for convenience.

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';
import { CONTACT } from '@/lib/contact';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function toWords(n: number): string {
  // Simple number to words for invoice footer (Indian numbering)
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (n === 0) return 'Zero';
  if (n < 0) return 'Minus ' + toWords(-n);
  let str = '';
  if (Math.floor(n / 100000) > 0) { str += toWords(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
  if (Math.floor(n / 1000) > 0)   { str += toWords(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
  if (Math.floor(n / 100) > 0)    { str += toWords(Math.floor(n / 100)) + ' Hundred '; n %= 100; }
  if (n > 0) { if (str !== '') str += 'and '; str += n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : ''); }
  return str.trim();
}

export default function InvoicePage() {
  const router  = useRouter();
  const params  = useParams();
  const id      = params?.id as string;
  const supabase = createClient();
  const [order, setOrder]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printed = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return; }
      fetch(`/api/orders/${id}`).then(r => r.json()).then(data => {
        if (data.error) { router.push('/account/orders'); return; }
        setOrder(data);
        setLoading(false);
      });
    });
  }, [id]);

  // Auto-open print dialog once loaded
  useEffect(() => {
    if (!loading && order && !printed.current) {
      printed.current = true;
      setTimeout(() => window.print(), 600);
    }
  }, [loading, order]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
      Preparing invoice…
    </div>
  );
  if (!order) return null;

  const subtotal       = order.subtotal        || 0;
  const discountAmount = order.discount_amount || 0;
  const deliveryCharge = order.delivery_charge || 0;
  const total          = order.total           || 0;
  const taxableAmount  = Math.round(total / 1.18); // assume 18% GST on total
  const gstAmount      = total - taxableAmount;
  const cgst           = Math.round(gstAmount / 2);
  const sgst           = Math.round(gstAmount / 2);
  const invoiceNo      = `INV-${order.order_number}`;

  return (
    <>
      {/* Print button (hidden when printing) */}
      <div className="no-print" style={{ background: '#0B2447', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => window.print()} style={{ padding: '9px 22px', background: '#F97316', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          🖨 Save as PDF / Print
        </button>
        <button onClick={() => router.back()} style={{ padding: '9px 22px', background: 'transparent', color: '#ccc', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          ← Back to Order
        </button>
        <span style={{ color: '#7A8EA8', fontSize: 13 }}>Tip: In the print dialog, choose &ldquo;Save as PDF&rdquo;</span>
      </div>

      {/* Invoice body */}
      <div className="invoice-paper">

        {/* Header */}
        <div className="inv-header">
          <div className="inv-brand">
            <div className="inv-logo-text">KARUR PLYWOOD</div>
            <div className="inv-logo-sub">&amp; Company</div>
          </div>
          <div className="inv-title-block">
            <div className="inv-title">TAX INVOICE</div>
            <div className="inv-subtitle">GST Invoice</div>
          </div>
        </div>

        {/* Seller + Invoice details row */}
        <div className="inv-meta-row">
          <div className="inv-meta-block inv-meta-seller">
            <div className="inv-meta-heading">Sold By</div>
            <div className="inv-meta-name">{CONTACT.businessName}</div>
            <div className="inv-meta-line">{CONTACT.address}</div>
            <div className="inv-meta-line">📞 {CONTACT.phone}</div>
            <div className="inv-meta-line">✉️ {CONTACT.email}</div>
            <div className="inv-meta-line inv-gst">GSTIN: <strong>{CONTACT.gst}</strong></div>
          </div>
          <div className="inv-meta-block inv-meta-details">
            <table className="inv-details-table">
              <tbody>
                <tr>
                  <td>Invoice No.</td>
                  <td><strong>{invoiceNo}</strong></td>
                </tr>
                <tr>
                  <td>Order No.</td>
                  <td>{order.order_number}</td>
                </tr>
                <tr>
                  <td>Invoice Date</td>
                  <td>{formatDate(order.created_at)}</td>
                </tr>
                <tr>
                  <td>Payment</td>
                  <td>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td style={{ textTransform: 'capitalize' }}>{order.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill To */}
        <div className="inv-bill-to">
          <div className="inv-section-label">Bill To / Ship To</div>
          <div className="inv-bill-name">{order.delivery_name}</div>
          {order.customers?.gstin && <div className="inv-bill-line">GSTIN: {order.customers.gstin}</div>}
          <div className="inv-bill-line">{order.delivery_line1}{order.delivery_line2 ? `, ${order.delivery_line2}` : ''}</div>
          <div className="inv-bill-line">{order.delivery_city}, Tamil Nadu — {order.delivery_pincode}</div>
          <div className="inv-bill-line">📞 {order.delivery_phone}</div>
        </div>

        {/* Items table */}
        <table className="inv-items">
          <thead>
            <tr>
              <th className="inv-th-sl">Sl.</th>
              <th className="inv-th-desc">Description of Goods</th>
              <th className="inv-th-hsn">HSN</th>
              <th className="inv-th-qty">Qty</th>
              <th className="inv-th-rate">Rate (₹)</th>
              <th className="inv-th-amt">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'inv-row-alt' : ''}>
                <td className="inv-td-sl">{i + 1}</td>
                <td className="inv-td-desc">
                  {item.product_name}
                  {item.variant_label ? <div className="inv-variant">{item.variant_label}</div> : null}
                </td>
                <td className="inv-td-hsn">4412</td>
                <td className="inv-td-qty">{item.quantity}</td>
                <td className="inv-td-rate">{item.unit_price?.toLocaleString('en-IN')}</td>
                <td className="inv-td-amt">{item.line_total?.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {/* Padding rows for short invoices */}
            {(order.order_items?.length || 0) < 5 && Array.from({ length: 5 - (order.order_items?.length || 0) }).map((_, i) => (
              <tr key={`pad-${i}`} className="inv-row-pad">
                <td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="inv-totals-row">
          <div className="inv-amount-words">
            <div className="inv-section-label">Amount in Words</div>
            <div className="inv-words">Rupees {toWords(Math.round(total))} Only</div>
            {order.coupon_code && (
              <div className="inv-coupon-note">Coupon Applied: {order.coupon_code} (₹{discountAmount.toLocaleString('en-IN')} off)</div>
            )}
          </div>
          <table className="inv-totals-table">
            <tbody>
              <tr><td>Subtotal</td><td>₹{subtotal.toLocaleString('en-IN')}</td></tr>
              {discountAmount > 0 && <tr className="inv-discount-row"><td>Discount</td><td>−₹{discountAmount.toLocaleString('en-IN')}</td></tr>}
              {deliveryCharge > 0 && <tr><td>Delivery</td><td>₹{deliveryCharge.toLocaleString('en-IN')}</td></tr>}
              <tr><td>Taxable Value</td><td>₹{taxableAmount.toLocaleString('en-IN')}</td></tr>
              <tr><td>CGST @ 9%</td><td>₹{cgst.toLocaleString('en-IN')}</td></tr>
              <tr><td>SGST @ 9%</td><td>₹{sgst.toLocaleString('en-IN')}</td></tr>
              <tr className="inv-total-row"><td>Total</td><td>₹{total.toLocaleString('en-IN')}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="inv-footer">
          <div className="inv-footer-notes">
            <div className="inv-section-label">Terms &amp; Notes</div>
            <ul className="inv-terms">
              <li>Goods once sold will not be taken back without prior intimation.</li>
              <li>Subject to Karur jurisdiction only.</li>
              <li>E &amp; OE — Errors and Omissions Excepted.</li>
              <li>HSN Code 4412 — Plywood, veneered panels and similar laminated wood.</li>
            </ul>
          </div>
          <div className="inv-footer-sign">
            <div className="inv-section-label">For {CONTACT.businessName}</div>
            <div className="inv-sign-space"></div>
            <div className="inv-sign-label">Authorised Signatory</div>
          </div>
        </div>

        <div className="inv-foot-strip">
          This is a computer-generated invoice. No signature required if printed electronically.
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #f0f0f0; }

        .no-print { position: sticky; top: 0; z-index: 100; }

        .invoice-paper {
          max-width: 210mm;
          margin: 20px auto;
          background: #fff;
          padding: 20mm 18mm 16mm;
          font-family: 'Inter', Arial, sans-serif;
          font-size: 11px;
          color: #1a1a1a;
          box-shadow: 0 2px 24px rgba(0,0,0,0.12);
        }

        /* Header */
        .inv-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 2px solid #0B2447; padding-bottom: 14px; margin-bottom: 16px;
        }
        .inv-logo-text { font-size: 22px; font-weight: 800; color: #0B2447; letter-spacing: -0.5px; }
        .inv-logo-sub  { font-size: 12px; color: #F97316; font-weight: 600; letter-spacing: 1px; }
        .inv-title     { font-size: 20px; font-weight: 800; color: #0B2447; text-align: right; }
        .inv-subtitle  { font-size: 11px; color: #888; text-align: right; letter-spacing: 1px; text-transform: uppercase; }

        /* Meta row */
        .inv-meta-row    { display: flex; gap: 16px; margin-bottom: 14px; }
        .inv-meta-block  { flex: 1; border: 1px solid #ddd; border-radius: 4px; padding: 10px 12px; }
        .inv-meta-heading { font-size: 9px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .inv-meta-name   { font-size: 13px; font-weight: 700; color: #0B2447; margin-bottom: 3px; }
        .inv-meta-line   { font-size: 11px; color: #444; line-height: 1.6; }
        .inv-gst         { margin-top: 5px; color: #0B2447; }
        .inv-details-table { width: 100%; border-collapse: collapse; }
        .inv-details-table td { padding: 3px 4px; font-size: 11px; color: #333; }
        .inv-details-table td:first-child { color: #888; width: 45%; }

        /* Bill to */
        .inv-bill-to { border: 1px solid #ddd; border-radius: 4px; padding: 10px 12px; margin-bottom: 14px; }
        .inv-section-label { font-size: 9px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .inv-bill-name { font-size: 13px; font-weight: 700; color: #0B2447; margin-bottom: 3px; }
        .inv-bill-line { font-size: 11px; color: #444; line-height: 1.6; }

        /* Items table */
        .inv-items { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        .inv-items th { background: #0B2447; color: #fff; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .inv-th-sl, .inv-td-sl   { text-align: center; width: 28px; }
        .inv-th-desc, .inv-td-desc { text-align: left; }
        .inv-th-hsn, .inv-td-hsn  { width: 52px; }
        .inv-th-qty, .inv-td-qty  { width: 40px; }
        .inv-th-rate, .inv-td-rate { width: 70px; }
        .inv-th-amt, .inv-td-amt  { width: 80px; }
        .inv-items td { padding: 7px 6px; font-size: 11px; text-align: right; border-bottom: 1px solid #f0f0f0; }
        .inv-items td.inv-td-desc { text-align: left; }
        .inv-row-alt td { background: #fafafa; }
        .inv-row-pad td { height: 26px; }
        .inv-variant { font-size: 10px; color: #888; margin-top: 2px; }

        /* Totals */
        .inv-totals-row { display: flex; gap: 16px; border-top: 2px solid #0B2447; padding-top: 12px; margin-top: 0; }
        .inv-amount-words { flex: 1; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; }
        .inv-words { font-size: 12px; font-weight: 600; color: #0B2447; line-height: 1.4; margin-top: 3px; }
        .inv-coupon-note { font-size: 10px; color: #16a34a; margin-top: 5px; }
        .inv-totals-table { border-collapse: collapse; min-width: 220px; }
        .inv-totals-table td { padding: 4px 8px; font-size: 11px; color: #333; }
        .inv-totals-table td:first-child { color: #888; }
        .inv-totals-table td:last-child  { text-align: right; font-weight: 500; }
        .inv-discount-row td { color: #16a34a !important; }
        .inv-total-row td { font-size: 14px; font-weight: 800; color: #0B2447 !important; border-top: 2px solid #0B2447; padding-top: 6px; }

        /* Footer */
        .inv-footer { display: flex; gap: 16px; margin-top: 16px; }
        .inv-footer-notes { flex: 1; }
        .inv-terms { padding-left: 14px; margin-top: 5px; }
        .inv-terms li { font-size: 10px; color: #666; line-height: 1.7; }
        .inv-footer-sign { width: 180px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
        .inv-sign-space { height: 50px; border-bottom: 1px solid #ccc; margin: 10px 0 6px; }
        .inv-sign-label { font-size: 10px; color: #888; }
        .inv-foot-strip { text-align: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid #eee; font-size: 9px; color: #aaa; letter-spacing: 0.5px; }

        /* Print styles */
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .invoice-paper { margin: 0; box-shadow: none; padding: 12mm 12mm 10mm; }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>
    </>
  );
}

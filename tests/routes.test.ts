// Run: npx tsx tests/routes.test.ts
// Integration test of the REAL route handlers against an in-memory fake database.
// Razorpay, email and WhatsApp are replaced with recorders. Verifies what is stored,
// what Razorpay is asked to charge, what customers are told, and the dispatch block.
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(__dirname, '..');
const req = createRequire(__filename);
const f = (p: string) => path.join(root, p);
const mock = (p: string, exports: any) => {
  const file = f(p);
  (req.cache as any)[file] = { id: file, filename: file, loaded: true, exports, children: [], paths: [] };
};

// ── fake database ───────────────────────────────────────────
const db: any = { orders: [] as any[], items: [] as any[], missingDeliveryColumns: false, seq: 0 };
function table(name: string) {
  const q: any = { op: 'select', eqs: [] as [string, any][], rows: null, patch: null };
  const run = () => {
    if (name === 'orders') {
      if (q.op === 'insert') {
        const row = { ...q.rows[0] };
        if (db.missingDeliveryColumns && 'delivery_status' in row) {
          return { data: null, error: { message: "Could not find the 'delivery_status' column of 'orders' in the schema cache" } };
        }
        row.id = `order-${++db.seq}`; row.order_number = `KPC-T${db.seq}`;
        db.orders.push(row);
        return { data: row, error: null };
      }
      const match = db.orders.filter((o: any) => q.eqs.every(([c, v]: any) => o[c] === v));
      if (q.op === 'update') { match.forEach((o: any) => Object.assign(o, q.patch)); return { data: null, error: null }; }
      return { data: match[0] ?? null, error: match[0] ? null : { message: 'not found' } };
    }
    if (name === 'customers') return { data: { id: 'u1', full_name: 'Test Customer', email: 'c@test.in', phone: '9999999999' }, error: null };
    if (name === 'order_items' && q.op === 'insert') { db.items.push(...q.rows); return { data: null, error: null }; }
    return { data: null, error: null };
  };
  const api: any = {
    upsert: async () => ({ error: null }),
    select: () => api,
    eq: (c: string, v: any) => { q.eqs.push([c, v]); return api; },
    ilike: () => api, maybeSingle: async () => ({ data: null, error: null }),
    insert: (rows: any) => { q.op = 'insert'; q.rows = Array.isArray(rows) ? rows : [rows]; return api; },
    update: (patch: any) => { q.op = 'update'; q.patch = patch; return api; },
    single: async () => run(),
    then: (resolve: any) => resolve(run()),
  };
  return api;
}
mock('src/lib/db.ts', { supabaseAdmin: { from: table, rpc: async () => ({}) }, supabase: {} });

// ── recorders ───────────────────────────────────────────────
const rec: any = { rzp: [], confirm: [], owner: [], customerWA: [] };
let adminAuthed = true;
mock('src/lib/auth-server.ts', { createServerSupabase: () => ({ auth: { getSession: async () => ({ data: { session: { user: { id: 'u1', email: 'c@test.in', user_metadata: {} } } } }) } }) });
mock('src/lib/auth.ts', { getAdminSession: async () => (adminAuthed ? { email: 'care@kpc' } : null) });
mock('src/lib/razorpay.ts', { createRazorpayOrder: async (a: any) => { rec.rzp.push(a); return { id: 'rzp_order_1', amount: Math.round(a.amountRupees * 100), currency: 'INR' }; } });
mock('src/lib/deliveryEngine.ts', { getDeliveryPromiseForCoords: async () => null, getDeliveryPromiseForArea: async () => null });
mock('src/lib/email.ts', {
  sendOrderConfirmation: async (d: any) => { rec.confirm.push(d); },
  sendOwnerOrderAlert: async (d: any) => { rec.owner.push(d); },
  sendStatusUpdate: async () => {},
});
const realWA = req(f('src/lib/whatsapp.ts'));
mock('src/lib/whatsapp.ts', { ...realWA,
  sendCustomerOrderPlacedWhatsApp: async (phone: string, message: string) => { rec.customerWA.push({ phone, message }); return { ok: true, method: 'skipped' }; },
  sendCustomerWhatsAppStatus: async () => {}, sendCustomerFulfillmentWhatsApp: async () => {},
});

const { NextRequest } = req('next/server');
const checkout = req(f('src/app/api/checkout/route.ts'));
const adminOrders = req(f('src/app/api/orders/admin/route.ts'));
const adminDelivery = req(f('src/app/api/orders/admin/delivery/route.ts'));
const { CUSTOMER_ORDER_PLACED_MESSAGE, PICKUP_ORDER_PLACED_MESSAGE } = req(f('src/lib/deliveryWorkflow.ts'));

const mk = (method: string, url: string, body: any) =>
  new NextRequest(`http://localhost${url}`, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const address = { full_name: 'Test', phone: '9999999999', line1: '1 Main Rd', city: 'Karur', state: 'Tamil Nadu', pincode: '639001' };
const place = (subtotal: number, payment: 'cod' | 'razorpay', extra: any = {}) =>
  checkout.POST(mk('POST', '/api/checkout', {
    address, payment_method: payment, shipping_method: 'standard',
    shipping_cost: 999, // hostile / stale client value — must be ignored
    items: [{ product_name: 'Test Item', unit_price: subtotal, quantity: 1 }], ...extra,
  }));

let passed = 0;
const t = async (name: string, fn: () => Promise<void>) => { await fn(); passed++; console.log('  ✓', name); };
const silence = console.error; console.error = () => {}; // routes log expected errors in some tests

(async () => {
  console.log('Checkout route — ₹500 / ₹5,000 / ₹10,000 / ₹50,000');
  for (const amount of [500, 5000, 10000, 50000]) {
    for (const pay of ['razorpay', 'cod'] as const) {
      await t(`₹${amount} via ${pay}: product value only, delivery pending, no free-delivery rule`, async () => {
        db.orders.length = 0; Object.keys(rec).forEach(k => (rec[k] = []));
        const res = await place(amount, pay);
        assert.equal(res.status, 201);
        const o = db.orders[0];
        assert.equal(o.subtotal, amount);
        assert.equal(o.total, amount, 'total must equal product value');
        assert.equal(o.delivery_charge, 0);
        assert.equal(o.shipping_method, 'standard');
        assert.equal(o.delivery_status, 'Pending Confirmation');
        assert.equal(o.customer_approval_status, 'Pending');
        assert.equal(o.delivery_payment_status, 'Pay on delivery');
        assert.equal(o.payment_status, 'pending');
        if (pay === 'razorpay') {
          assert.equal(rec.rzp.length, 1);
          assert.equal(rec.rzp[0].amountRupees, amount, 'Razorpay must be asked for the product value only');
          const body = await res.json();
          assert.equal(body.razorpay.amount, amount * 100);
        } else {
          assert.equal(rec.rzp.length, 0);
          assert.equal(rec.confirm[0].total, amount);
          assert.equal(rec.confirm[0].deliveryCharge, 0);
          assert.equal(rec.customerWA[0].message, CUSTOMER_ORDER_PLACED_MESSAGE, 'approved WhatsApp wording');
          assert.match(rec.owner[0].deliveryNote, /Delivery charges are extra/);
        }
      });
    }
  }

  console.log('Other checkout paths');
  await t('store pickup → Not Applicable, pickup message, no care action', async () => {
    db.orders.length = 0; Object.keys(rec).forEach(k => (rec[k] = []));
    const res = await place(5000, 'cod', { shipping_method: 'pickup' });
    assert.equal(res.status, 201);
    const o = db.orders[0];
    assert.equal(o.delivery_status, 'Not Applicable');
    assert.equal(o.shipping_method, 'pickup');
    assert.equal(o.total, 5000);
    assert.equal(rec.customerWA[0].message, PICKUP_ORDER_PLACED_MESSAGE);
    assert.equal(rec.owner[0].deliveryNote, undefined);
  });
  await t('tampered shipping_method falls back to standard', async () => {
    db.orders.length = 0;
    await place(1000, 'cod', { shipping_method: 'free' });
    assert.equal(db.orders[0].shipping_method, 'standard');
    assert.equal(db.orders[0].delivery_status, 'Pending Confirmation');
  });
  await t('migration NOT yet run → order still placed (delivery columns skipped)', async () => {
    db.orders.length = 0; db.missingDeliveryColumns = true;
    const res = await place(10000, 'cod');
    db.missingDeliveryColumns = false;
    assert.equal(res.status, 201);
    assert.equal(db.orders.length, 1);
    assert.equal(db.orders[0].total, 10000);
    assert.equal('delivery_status' in db.orders[0], false);
  });

  console.log('Care workflow + dispatch block through the real admin routes');
  db.orders.length = 0; await place(10000, 'cod');
  const id = db.orders[0].id;
  const delivery = (body: any) => adminDelivery.PATCH(mk('PATCH', '/api/orders/admin/delivery', { id, ...body }));
  const status = (body: any) => adminOrders.PATCH(mk('PATCH', '/api/orders/admin', { id, ...body }));

  await t('admin routes reject non-admins', async () => {
    adminAuthed = false;
    assert.equal((await delivery({ care_remarks: 'x' })).status, 401);
    assert.equal((await status({ status: 'shipped' })).status, 401);
    adminAuthed = true;
  });
  await t('dispatch blocked before quote/approval (legacy status AND fulfillment)', async () => {
    assert.equal((await status({ status: 'shipped' })).status, 409);
    assert.equal((await status({ fulfillment_status: 'OUT_FOR_DELIVERY' })).status, 409);
    assert.equal((await delivery({ delivery_status: 'Ready for Dispatch' })).status, 400);
    assert.notEqual(db.orders[0].status, 'shipped');
  });
  await t('saving notes on a gated order is not blocked', async () => {
    assert.equal((await status({ admin_notes: 'call customer' })).status, 200);
  });
  await t('quote → approval → dispatch allowed; payment columns never touched', async () => {
    const before = { total: db.orders[0].total, payment_status: db.orders[0].payment_status, subtotal: db.orders[0].subtotal };
    assert.equal((await delivery({ actual_transport_cost: 450, delivery_charge_quoted: 500, transport_type: 'Auto', transporter_name: 'Murugan', transporter_phone: '9000000000', delivery_status: 'Quotation Communicated' })).status, 200);
    assert.equal(db.orders[0].delivery_status, 'Quotation Communicated');
    assert.equal((await status({ status: 'shipped' })).status, 409, 'still blocked: quoted but not approved');
    assert.equal((await delivery({ customer_approval_status: 'Approved', delivery_status: 'Customer Approved', expected_delivery_date: '2026-12-05' })).status, 200);
    assert.ok(db.orders[0].delivery_approved_at);
    assert.equal((await delivery({ delivery_status: 'Ready for Dispatch' })).status, 200);
    assert.equal((await status({ status: 'shipped' })).status, 200);
    assert.equal((await delivery({ delivery_status: 'Delivered', delivery_payment_status: 'Paid to transporter', delivery_payment_note: 'cash to driver' })).status, 200);
    assert.equal(db.orders[0].total, before.total, 'order total unchanged');
    assert.equal(db.orders[0].subtotal, before.subtotal);
    assert.equal(db.orders[0].payment_status, before.payment_status, 'product payment record unchanged');
    assert.equal(db.orders[0].delivery_charge, 0, 'original delivery_charge column unchanged');
    assert.equal(db.orders[0].delivery_charge_quoted, 500);
  });
  await t('declined customer cannot be dispatched', async () => {
    db.orders.length = 0; await place(5000, 'razorpay');
    const id2 = db.orders[0].id;
    const d2 = (b: any) => adminDelivery.PATCH(mk('PATCH', '/api/orders/admin/delivery', { id: id2, ...b }));
    assert.equal((await d2({ delivery_charge_quoted: 800, delivery_status: 'Quotation Communicated' })).status, 200);
    assert.equal((await d2({ customer_approval_status: 'Declined', delivery_status: 'Customer Declined' })).status, 200);
    assert.equal((await d2({ delivery_status: 'Dispatched' })).status, 400);
    assert.equal((await adminOrders.PATCH(mk('PATCH', '/api/orders/admin', { id: id2, status: 'shipped' }))).status, 409);
  });
  await t('older order (no delivery_status) is never gated, and can be enabled', async () => {
    db.orders.length = 0;
    db.orders.push({ id: 'legacy-1', order_number: 'OLD-1', status: 'confirmed', fulfillment_status: 'CONFIRMED', total: 3000, delivery_charge: 0, delivery_status: null });
    assert.equal((await adminOrders.PATCH(mk('PATCH', '/api/orders/admin', { id: 'legacy-1', status: 'shipped' }))).status, 200);
    db.orders.push({ id: 'legacy-2', order_number: 'OLD-2', status: 'confirmed', fulfillment_status: 'CONFIRMED', total: 3000, delivery_charge: 0, delivery_status: null });
    assert.equal((await adminDelivery.PATCH(mk('PATCH', '/api/orders/admin/delivery', { id: 'legacy-2', action: 'enable' }))).status, 200);
    assert.equal(db.orders[1].delivery_status, 'Pending Confirmation');
    assert.equal((await adminOrders.PATCH(mk('PATCH', '/api/orders/admin', { id: 'legacy-2', status: 'shipped' }))).status, 409);
  });
  await t('pickup order: delivery edits rejected, dispatch not gated', async () => {
    db.orders.length = 0; await place(2000, 'cod', { shipping_method: 'pickup' });
    const pid = db.orders[0].id;
    assert.equal((await adminDelivery.PATCH(mk('PATCH', '/api/orders/admin/delivery', { id: pid, care_remarks: 'x' }))).status, 400);
    assert.equal((await adminOrders.PATCH(mk('PATCH', '/api/orders/admin', { id: pid, status: 'shipped' }))).status, 200);
  });

  console.error = silence;
  console.log(`\n${passed} route checks passed`);
})().catch(e => { console.error = silence; console.error('FAILED:', e); process.exit(1); });

// Run: npx tsx tests/deliveryWorkflow.test.ts
import assert from 'node:assert/strict';
import {
  payableNow, initialDeliveryFields, dispatchBlockReason, validateDeliveryUpdate,
  isMissingDeliveryColumnError, stripDeliveryColumns, normalizeShippingMethod,
} from '../src/lib/deliveryWorkflow';

let passed = 0;
const t = (name: string, fn: () => void) => { fn(); passed++; console.log('  ✓', name); };

console.log('Checkout amount — delivery never included, no free-delivery rule');
for (const subtotal of [500, 5000, 10000, 50000]) {
  t(`₹${subtotal}: payable now = product value only`, () => {
    assert.equal(payableNow(subtotal), subtotal);
    assert.equal(payableNow(subtotal, 0), subtotal);
  });
  t(`₹${subtotal}: coupon discount reduces payable, never adds delivery`, () => {
    assert.equal(payableNow(subtotal, 100), subtotal - 100);
    assert.ok(payableNow(subtotal, 100) <= subtotal);
  });
  t(`₹${subtotal}: starts as Pending Confirmation, approval Pending, pay on delivery`, () => {
    const f = initialDeliveryFields('standard');
    assert.equal(f.delivery_status, 'Pending Confirmation');
    assert.equal(f.customer_approval_status, 'Pending');
    assert.equal(f.delivery_payment_status, 'Pay on delivery');
  });
  t(`₹${subtotal}: dispatch blocked until approval`, () => {
    const order = { ...initialDeliveryFields('standard') };
    assert.ok(dispatchBlockReason(order, 'Ready for Dispatch'));
    assert.ok(dispatchBlockReason(order, 'Dispatched'));
    assert.ok(dispatchBlockReason(order, 'shipped'));
    assert.ok(dispatchBlockReason(order, 'OUT_FOR_DELIVERY'));
  });
}
t('discount larger than subtotal clamps to 0', () => assert.equal(payableNow(500, 900), 0));

console.log('Store pickup / legacy orders are not gated');
t('pickup → Not Applicable, never blocked', () => {
  const p = initialDeliveryFields('pickup');
  assert.equal(p.delivery_status, 'Not Applicable');
  assert.equal(dispatchBlockReason(p, 'Dispatched'), null);
});
t('legacy order (delivery_status null) is never blocked', () => {
  assert.equal(dispatchBlockReason({ delivery_status: null }, 'shipped'), null);
});
t('unknown shipping_method defaults to standard', () => {
  assert.equal(normalizeShippingMethod(undefined), 'standard');
  assert.equal(normalizeShippingMethod('hack'), 'standard');
  assert.equal(normalizeShippingMethod('pickup'), 'pickup');
});

console.log('Care workflow — quote → approval → dispatch');
const base = { ...initialDeliveryFields('standard') } as any;
t('cannot mark Quotation Communicated without an amount', () => {
  const r = validateDeliveryUpdate(base, { delivery_status: 'Quotation Communicated' });
  assert.equal(r.ok, false);
});
t('quote recorded → Quotation Communicated allowed, quoted_at stamped', () => {
  const r = validateDeliveryUpdate(base, { delivery_charge_quoted: 500, actual_transport_cost: 450, delivery_status: 'Quotation Communicated' });
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.patch.delivery_quoted_at);
});
const quoted = { ...base, delivery_status: 'Quotation Communicated', delivery_charge_quoted: 500 };
t('cannot approve without quote', () => {
  assert.equal(validateDeliveryUpdate(base, { customer_approval_status: 'Approved' }).ok, false);
});
t('cannot jump to Ready for Dispatch before approval', () => {
  assert.equal(validateDeliveryUpdate(quoted, { delivery_status: 'Ready for Dispatch' }).ok, false);
});
t('Customer Approved status needs approval = Approved', () => {
  assert.equal(validateDeliveryUpdate(quoted, { delivery_status: 'Customer Approved' }).ok, false);
  const r = validateDeliveryUpdate(quoted, { customer_approval_status: 'Approved', delivery_status: 'Customer Approved' });
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.patch.delivery_approved_at);
});
const approved = { ...quoted, delivery_status: 'Customer Approved', customer_approval_status: 'Approved' };
t('after approval: Ready for Dispatch → Dispatched → Delivered allowed', () => {
  for (const s of ['Ready for Dispatch', 'Dispatched', 'Delivered']) {
    assert.equal(validateDeliveryUpdate(approved, { delivery_status: s }).ok, true, s);
  }
  assert.equal(dispatchBlockReason(approved, 'shipped'), null);
  assert.equal(dispatchBlockReason(approved, 'OUT_FOR_DELIVERY'), null);
});
t('declined customer cannot be dispatched', () => {
  const declined = { ...quoted, delivery_status: 'Customer Declined', customer_approval_status: 'Declined' };
  assert.equal(validateDeliveryUpdate(declined, { delivery_status: 'Dispatched' }).ok, false);
  assert.ok(dispatchBlockReason(declined, 'Dispatched'));
});
t('pickup / legacy orders reject workflow edits', () => {
  assert.equal(validateDeliveryUpdate({ delivery_status: 'Not Applicable' }, { care_remarks: 'x' }).ok, false);
  assert.equal(validateDeliveryUpdate({ delivery_status: null }, { care_remarks: 'x' }).ok, false);
});
t('negative / non-numeric amounts rejected', () => {
  assert.equal(validateDeliveryUpdate(base, { delivery_charge_quoted: -5 }).ok, false);
  assert.equal(validateDeliveryUpdate(base, { actual_transport_cost: NaN as any }).ok, false);
});
t('unknown statuses rejected', () => {
  assert.equal(validateDeliveryUpdate(base, { delivery_status: 'Whatever' }).ok, false);
});

console.log('Safety net — checkout still works if migration not yet run');
t('missing-column error detected only for delivery columns', () => {
  assert.equal(isMissingDeliveryColumnError("Could not find the 'delivery_status' column of 'orders' in the schema cache"), true);
  assert.equal(isMissingDeliveryColumnError("Could not find the 'coupon_code' column of 'orders' in the schema cache"), false);
});
t('stripDeliveryColumns removes only new columns', () => {
  const row = stripDeliveryColumns({ subtotal: 1, delivery_status: 'x', shipping_method: 'standard', total: 1 });
  assert.deepEqual(Object.keys(row).sort(), ['subtotal', 'total']);
});

console.log(`\n${passed} checks passed`);

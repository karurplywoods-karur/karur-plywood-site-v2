// src/lib/deliveryWorkflow.ts
// Single source of truth for the "delivery charges are EXTRA" workflow.
//
// Business rule (finalized):
//  • Every home-delivery order pays ONLY for materials at checkout (Razorpay / COD).
//  • Transport charge is never part of the checkout or Razorpay amount.
//  • Customer care confirms the actual transport cost after the order, the customer
//    approves it, and the customer pays the transport person directly ON DELIVERY.
//  • KPC never collects the transport money, so there is no delivery payment record
//    in Razorpay / revenue. Dispatch is blocked until the customer has approved.
//  • Store pickup has no transport cost → workflow not applicable.

export const DELIVERY_STATUSES = [
  'Pending Confirmation',
  'Quotation Communicated',
  'Customer Approved',
  'Customer Declined',
  'Ready for Dispatch',
  'Dispatched',
  'Delivered',
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const NOT_APPLICABLE = 'Not Applicable';

export const APPROVAL_STATUSES = ['Pending', 'Approved', 'Declined'] as const;
export const DELIVERY_PAYMENT_STATUSES = ['Pay on delivery', 'Paid to transporter', 'Not applicable'] as const;
export const TRANSPORT_TYPES = ['Auto', 'Mini Truck / Tempo', 'Lorry', 'Transport Service', 'Other'] as const;

// Statuses that mean the goods are leaving / have left — these need customer approval first.
export const DISPATCH_STATUSES: readonly string[] = ['Ready for Dispatch', 'Dispatched', 'Delivered'];

export const PAYABLE_NOTE = 'Delivery charges extra — paid directly to the transport provider';

export const DELIVERY_NOTICE_TITLE = 'Delivery Charges Extra';
export const DELIVERY_NOTICE_LINES = [
  'Delivery charges are applicable to all orders, irrespective of order value.',
  'Delivery charges are not included in the checkout amount. Our customer care team will contact you after order placement to confirm the actual transportation cost.',
  'The transport charge is paid directly to the transport provider on delivery. Delivery will be arranged after your approval of the charge.',
];
export const PICKUP_NOTICE = 'Store pickup — no delivery charges.';

export const CUSTOMER_ORDER_PLACED_MESSAGE =
  'Thank you for shopping with KPC Online Store. Your product order has been received successfully. ' +
  'Delivery charges are extra and are paid directly to the transport provider. ' +
  'Our customer care team will confirm the transport cost with you before dispatch.';

/** What the customer pays NOW (Razorpay / COD). Delivery is deliberately not a parameter. */
export function payableNow(subtotal: number, discount = 0): number {
  return Math.max(0, Math.round((subtotal - Math.min(discount, subtotal)) * 100) / 100);
}

export function normalizeShippingMethod(v: unknown): 'standard' | 'pickup' {
  return v === 'pickup' ? 'pickup' : 'standard';
}

/** Delivery columns to store on a NEW order. */
export function initialDeliveryFields(shippingMethod: 'standard' | 'pickup') {
  if (shippingMethod === 'pickup') {
    return {
      shipping_method: 'pickup',
      delivery_status: NOT_APPLICABLE,
      customer_approval_status: null,
      delivery_payment_status: 'Not applicable',
    };
  }
  return {
    shipping_method: 'standard',
    delivery_status: 'Pending Confirmation',
    customer_approval_status: 'Pending',
    delivery_payment_status: 'Pay on delivery',
  };
}

// Columns added by the migration — used to retry an insert safely if the migration
// has not been run yet (checkout must never break because of a missing column).
export const DELIVERY_COLUMNS = [
  'shipping_method', 'delivery_status', 'customer_approval_status', 'delivery_payment_status',
  'transport_type', 'transporter_name', 'transporter_phone', 'actual_transport_cost',
  'delivery_charge_quoted', 'delivery_payment_note', 'care_remarks', 'expected_delivery_date',
  'delivery_quoted_at', 'delivery_approved_at', 'delivery_updated_by',
];

export function stripDeliveryColumns<T extends Record<string, any>>(row: T): T {
  const copy: Record<string, any> = { ...row };
  DELIVERY_COLUMNS.forEach(c => delete copy[c]);
  return copy as T;
}

export function isMissingDeliveryColumnError(message: string | undefined | null): boolean {
  const m = /Could not find the '([^']+)' column/i.exec(message || '');
  return !!m && DELIVERY_COLUMNS.includes(m[1]);
}

export interface DeliveryOrderLike {
  delivery_status?: string | null;
  customer_approval_status?: string | null;
  delivery_charge_quoted?: number | string | null;
}

/** true when the order is inside the new workflow (legacy orders & pickup are not gated). */
export function isGated(order: DeliveryOrderLike): boolean {
  return !!order.delivery_status && order.delivery_status !== NOT_APPLICABLE;
}

export function hasCustomerApproval(order: DeliveryOrderLike): boolean {
  return order.customer_approval_status === 'Approved'
    && order.delivery_charge_quoted !== null
    && order.delivery_charge_quoted !== undefined
    && order.delivery_charge_quoted !== ''
    && Number(order.delivery_charge_quoted) >= 0;
}

/** The dispatch block. `target` can be a delivery_status, legacy status or fulfillment_status. */
export function dispatchBlockReason(order: DeliveryOrderLike, target: string | undefined | null): string | null {
  if (!target || !isGated(order)) return null;
  const isDispatch =
    DISPATCH_STATUSES.includes(target) ||
    target === 'shipped' || target === 'delivered' ||
    target === 'OUT_FOR_DELIVERY' || target === 'DELIVERED';
  if (!isDispatch) return null;
  if (hasCustomerApproval(order)) return null;
  return 'Dispatch blocked: the delivery charge must be quoted to the customer and approved by the customer first (Delivery panel).';
}

export interface DeliveryUpdate {
  delivery_status?: string;
  transport_type?: string;
  transporter_name?: string;
  transporter_phone?: string;
  actual_transport_cost?: number | null;
  delivery_charge_quoted?: number | null;
  customer_approval_status?: string;
  delivery_payment_status?: string;
  delivery_payment_note?: string;
  care_remarks?: string;
  expected_delivery_date?: string | null;
}

/**
 * Validates a care-staff update against the current order and returns the final
 * set of columns to write (or an error). Pure function — unit-tested.
 */
export function validateDeliveryUpdate(
  current: DeliveryOrderLike & Record<string, any>,
  update: DeliveryUpdate,
): { ok: true; patch: Record<string, any> } | { ok: false; error: string } {
  if (current.delivery_status === NOT_APPLICABLE) {
    return { ok: false, error: 'This is a store-pickup order — there is no delivery workflow.' };
  }
  if (!current.delivery_status) {
    return { ok: false, error: 'Delivery workflow is not enabled for this (older) order.' };
  }

  if (update.delivery_status && !(DELIVERY_STATUSES as readonly string[]).includes(update.delivery_status)) {
    return { ok: false, error: `Unknown delivery status "${update.delivery_status}".` };
  }
  if (update.customer_approval_status && !(APPROVAL_STATUSES as readonly string[]).includes(update.customer_approval_status)) {
    return { ok: false, error: `Unknown approval status "${update.customer_approval_status}".` };
  }
  if (update.delivery_payment_status && !(DELIVERY_PAYMENT_STATUSES as readonly string[]).includes(update.delivery_payment_status)) {
    return { ok: false, error: `Unknown delivery payment status "${update.delivery_payment_status}".` };
  }
  for (const k of ['actual_transport_cost', 'delivery_charge_quoted'] as const) {
    const v = update[k];
    if (v !== undefined && v !== null && (!Number.isFinite(Number(v)) || Number(v) < 0)) {
      return { ok: false, error: `${k.replace(/_/g, ' ')} must be a positive number.` };
    }
  }

  const merged: Record<string, any> = { ...current, ...update };
  const patch: Record<string, any> = {};
  const keys = Object.keys(update) as (keyof DeliveryUpdate)[];
  keys.forEach(k => { if (update[k] !== undefined) patch[k] = update[k]; });

  const quoted = merged.delivery_charge_quoted;
  const hasQuote = quoted !== null && quoted !== undefined && quoted !== '';

  // Quote communicated needs an amount
  if (merged.delivery_status === 'Quotation Communicated' && !hasQuote) {
    return { ok: false, error: 'Enter the delivery charge quoted to the customer first.' };
  }
  // Approval needs an amount
  if (merged.customer_approval_status === 'Approved' && !hasQuote) {
    return { ok: false, error: 'Enter the delivery charge quoted to the customer before marking it approved.' };
  }
  // Status ↔ approval consistency
  if (merged.delivery_status === 'Customer Approved' && merged.customer_approval_status !== 'Approved') {
    return { ok: false, error: 'Set "Customer approval" to Approved to move to Customer Approved.' };
  }
  if (merged.delivery_status === 'Customer Declined' && merged.customer_approval_status !== 'Declined') {
    return { ok: false, error: 'Set "Customer approval" to Declined to move to Customer Declined.' };
  }
  // The dispatch block
  const block = dispatchBlockReason(merged, merged.delivery_status);
  if (block) return { ok: false, error: block };
  if (merged.customer_approval_status === 'Declined' && DISPATCH_STATUSES.includes(merged.delivery_status)) {
    return { ok: false, error: 'The customer declined the delivery charge — dispatch is not allowed.' };
  }

  // Timestamps
  if (update.delivery_charge_quoted !== undefined && hasQuote) patch.delivery_quoted_at = new Date().toISOString();
  if (update.customer_approval_status === 'Approved' && current.customer_approval_status !== 'Approved') {
    patch.delivery_approved_at = new Date().toISOString();
  }
  return { ok: true, patch };
}

export const PICKUP_ORDER_PLACED_MESSAGE =
  'Thank you for shopping with KPC Online Store. Your product order has been received successfully. ' +
  'This is a store-pickup order, so there are no delivery charges. We will let you know when it is ready for pickup.';

export function orderPlacedMessage(shippingMethod: string | null | undefined): string {
  return shippingMethod === 'pickup' ? PICKUP_ORDER_PLACED_MESSAGE : CUSTOMER_ORDER_PLACED_MESSAGE;
}

export const CARE_ACTION_NOTE =
  'Delivery charges are extra — contact the customer, get the transport cost, quote it (Admin → Orders → Delivery). Customer pays the transport provider on delivery.';

// Reservation (distributor stock) orders already get a "reservation received" message;
// this short follow-up carries the delivery-charge rule.
export const RESERVATION_DELIVERY_MESSAGE =
  'KPC Online Store: Delivery charges are extra and are paid directly to the transport provider. ' +
  'Our customer care team will confirm the transport cost with you before dispatch.';

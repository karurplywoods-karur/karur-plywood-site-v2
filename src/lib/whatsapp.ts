// src/lib/whatsapp.ts — WhatsApp notification helpers
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';
const SITE_URL = 'https://www.karurplywood.co.in';

export function buildOwnerOrderMessage(data: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: { product_name: string; quantity: number; line_total: number; variant_label?: string }[];
  total: number;
  paymentMethod: string;
  deliveryCity: string;
  deliveryPincode: string;
}) {
  const lines = data.items
    .map(i => {
      const v = i.variant_label ? ` (${i.variant_label})` : '';
      return `  - ${i.product_name}${v} x${i.quantity} = Rs.${i.line_total.toLocaleString('en-IN')}`;
    })
    .join('\n');

  const payment = data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)';

  return (
    `NEW ORDER: ${data.orderNumber}\n\n` +
    `Customer: ${data.customerName}\n` +
    `Phone: ${data.customerPhone}\n` +
    `Location: ${data.deliveryCity} - ${data.deliveryPincode}\n` +
    `Payment: ${payment}\n\n` +
    `Items:\n${lines}\n\n` +
    `Total: Rs.${data.total.toLocaleString('en-IN')}\n\n` +
    `Open admin to manage: ${SITE_URL}/admin/orders`
  );
}

export function getOwnerWhatsAppURL(message: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(message)}`;
}

// ── Customer-facing status messages ──────────────────────────────────────────

const STATUS_MESSAGES: Record<string, (data: CustomerStatusData) => string> = {
  confirmed: (d) =>
    `✅ *Order Confirmed — ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, your order has been confirmed by Karur Plywood & Company.\n\n` +
    `We will dispatch it within 1-2 business days and notify you before delivery.\n\n` +
    `Order total: ₹${d.total.toLocaleString('en-IN')}\n` +
    `Payment: ${d.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}\n\n` +
    `Questions? Reply to this message anytime. 🪵`,

  processing: (d) =>
    `🔄 *Order Being Processed — ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, we are currently preparing your order.\n\n` +
    `Estimated dispatch: within 1 business day.\n\n` +
    `Questions? Reply to this message. — Karur Plywood & Company`,

  shipped: (d) =>
    `🚛 *Your Order is On the Way! — ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, your order has been dispatched from our depot in Karur.\n\n` +
    `${d.trackingNumber ? `Tracking ref: ${d.trackingNumber}\n\n` : ''}` +
    `Please ensure someone is available to receive the delivery.\n\n` +
    `Payment due on delivery: ₹${d.total.toLocaleString('en-IN')}\n\n` +
    `— Karur Plywood & Company 🏭`,

  delivered: (d) =>
    `📦 *Order Delivered — ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, we hope your order was delivered in perfect condition!\n\n` +
    `If you notice any damage or issue, please reply here within 48 hours with photos.\n\n` +
    `Rate your experience: ${SITE_URL}/products\n\n` +
    `Thank you for shopping with Karur Plywood & Company! 🙏`,

  cancelled: (d) =>
    `❌ *Order Cancelled — ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, your order has been cancelled.\n\n` +
    `${d.adminNotes ? `Reason: ${d.adminNotes}\n\n` : ''}` +
    `If a payment was made, a refund will be processed within 5-7 business days.\n\n` +
    `Need help? Call us: +91 91596 66538\n` +
    `— Karur Plywood & Company`,
};

interface CustomerStatusData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentMethod: string;
  trackingNumber?: string;
  adminNotes?: string;
}

/**
 * Sends a WhatsApp message to the customer when order status changes.
 * Uses the WhatsApp Business API click-to-chat URL as a fallback
 * (owner needs to manually send from their phone), OR direct API
 * if WHATSAPP_API_TOKEN is set (Meta Business API).
 */
export async function sendCustomerWhatsAppStatus(
  status: string,
  data: CustomerStatusData
): Promise<{ ok: boolean; method: 'api' | 'skipped' }> {
  const messageFn = STATUS_MESSAGES[status];
  if (!messageFn) return { ok: true, method: 'skipped' }; // no message for this status

  const message = messageFn(data);

  // ── Option A: Meta WhatsApp Business API (if token is configured) ──
  const token   = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (token && phoneId && data.customerPhone) {
    try {
      // Normalize phone: strip +/spaces, ensure starts with country code
      const phone = data.customerPhone.replace(/\D/g, '');

      const res = await fetch(
        `https://graph.facebook.com/v19.0/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: message },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        console.error(`[whatsapp] API send failed (${res.status}):`, err);
        return { ok: false, method: 'api' };
      }

      return { ok: true, method: 'api' };
    } catch (err) {
      console.error('[whatsapp] API exception:', err);
      return { ok: false, method: 'api' };
    }
  }

  // ── Option B: No API token — log the message so it's visible in Vercel logs ──
  // Owner can copy-paste or set up the API later.
  console.log(`[whatsapp] STATUS UPDATE for ${data.customerPhone} (${status}):\n${message}`);
  return { ok: true, method: 'skipped' };
}

// ── Reserve / Verify flow messages (fulfillment_status, not legacy status) ──

interface FulfillmentMessageData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  estimatedDeliveryDate?: string | null;
  verificationSlaMinutes?: number;
  note?: string;
  paymentLinkUrl?: string;
}

function formatDeliveryDate(iso?: string | null): string {
  if (!iso) return 'shortly';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', weekday: 'long' });
}

const FULFILLMENT_MESSAGES: Record<string, (d: FulfillmentMessageData) => string> = {
  RESERVED: (d) =>
    `🙏 *Order Reserved — ${d.orderNumber}*\n\n` +
    `Thank you ${d.customerName} for reserving your order with Karur Plywood & Company.\n\n` +
    `We're verifying availability now. You'll receive confirmation within ${d.verificationSlaMinutes ?? 15} minutes during business hours.\n\n` +
    `No payment is needed yet — we'll only ask for payment after confirming your order.`,

  CONFIRMED: (d) =>
    `✅ *Order Confirmed — ${d.orderNumber}*\n\n` +
    `Great news! Your order has been confirmed.\n\n` +
    `Estimated delivery: ${formatDeliveryDate(d.estimatedDeliveryDate)}\n\n` +
    `A secure payment link will be sent shortly. It will be valid for 30 minutes.`,

  AWAITING_PAYMENT: (d) =>
    `💳 *Payment Link Ready — ${d.orderNumber}*\n\n` +
    `Please complete payment using the secure link below.\n\n` +
    `${d.paymentLinkUrl || ''}\n\n` +
    `Estimated delivery: ${formatDeliveryDate(d.estimatedDeliveryDate)}\n\n` +
    `⏰ This link expires in 30 minutes.`,

  UNAVAILABLE: (d) =>
    `⚠️ *Availability Update — ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, we're sorry — we couldn't confirm stock for this order right now.\n\n` +
    `${d.note ? `${d.note}\n\n` : ''}` +
    `Reply here and we'll offer an alternative product, a revised delivery date, or cancel the reservation — whichever works best for you. No payment was collected.`,

  PAYMENT_RECEIVED: (d) =>
    `💳 *Payment Received — ${d.orderNumber}*\n\n` +
    `Payment received successfully. Your order is now being prepared.\n\n` +
    `Estimated delivery: ${formatDeliveryDate(d.estimatedDeliveryDate)}\n\n` +
    `We'll notify you when your order is out for delivery.`,

  RESERVATION_EXPIRED: (d) =>
    `⏰ *Payment Link Expired — ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, the payment window for your confirmed order has expired and the reservation was released.\n\n` +
    `Still want it? Reply here and we'll generate a fresh payment link.`,

  PREPARING_ORDER: (d) =>
    `📦 *Preparing Your Order — ${d.orderNumber}*\n\n` +
    `Your order is being packed now.\n\n` +
    `Estimated delivery: ${formatDeliveryDate(d.estimatedDeliveryDate)}`,

  OUT_FOR_DELIVERY: (d) =>
    `🚚 *Out for Delivery — ${d.orderNumber}*\n\n` +
    `Your order has left our store and is on its way to you.\n\n` +
    `${d.note ? d.note : `Expected today${d.estimatedDeliveryDate ? ` (${formatDeliveryDate(d.estimatedDeliveryDate)})` : ''}.`}`,

  DELIVERED: (d) =>
    `✅ *Delivered — ${d.orderNumber}*\n\n` +
    `Your order has been delivered. Thank you for choosing Karur Plywood & Company!\n\n` +
    `Questions or issues? Just reply here.`,

  CANCELLED: (d) =>
    `❌ *Order Cancelled — ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, your order has been cancelled.` +
    `${d.note ? ` ${d.note}` : ''}\n\n` +
    `No payment was collected on this order. Reach out anytime if you'd like to reorder.`,
};

export function buildCustomerFulfillmentMessage(status: string, data: FulfillmentMessageData): string | null {
  const fn = FULFILLMENT_MESSAGES[status];
  return fn ? fn(data) : null;
}

/**
 * Sends a fulfillment-status WhatsApp message (Reserve/Verify/Payment flow).
 * Same delivery mechanism as sendCustomerWhatsAppStatus: Meta API if
 * configured, otherwise logs the message for manual send.
 */
export async function sendCustomerFulfillmentWhatsApp(
  status: string,
  data: FulfillmentMessageData
): Promise<{ ok: boolean; method: 'api' | 'skipped' }> {
  const message = buildCustomerFulfillmentMessage(status, data);
  if (!message) return { ok: true, method: 'skipped' };

  const token   = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (token && phoneId && data.customerPhone) {
    try {
      const phone = data.customerPhone.replace(/\D/g, '');
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: message } }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        console.error(`[whatsapp] fulfillment send failed (${res.status}):`, err);
        return { ok: false, method: 'api' };
      }
      return { ok: true, method: 'api' };
    } catch (err) {
      console.error('[whatsapp] fulfillment send exception:', err);
      return { ok: false, method: 'api' };
    }
  }

  console.log(`[whatsapp] FULFILLMENT UPDATE for ${data.customerPhone} (${status}):\n${message}`);
  return { ok: true, method: 'skipped' };
}

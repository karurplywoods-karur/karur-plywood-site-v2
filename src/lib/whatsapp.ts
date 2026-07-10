// src/lib/whatsapp.ts â€” WhatsApp notification helpers
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

// â”€â”€ Customer-facing status messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_MESSAGES: Record<string, (data: CustomerStatusData) => string> = {
  confirmed: (d) =>
    `âœ… *Order Confirmed â€” ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, your order has been confirmed by Karur Plywood & Company.\n\n` +
    `We will dispatch it within 1-2 business days and notify you before delivery.\n\n` +
    `Order total: â‚¹${d.total.toLocaleString('en-IN')}\n` +
    `Payment: ${d.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}\n\n` +
    `Questions? Reply to this message anytime. ðŸªµ`,

  processing: (d) =>
    `ðŸ”„ *Order Being Processed â€” ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, we are currently preparing your order.\n\n` +
    `Estimated dispatch: within 1 business day.\n\n` +
    `Questions? Reply to this message. â€” Karur Plywood & Company`,

  shipped: (d) =>
    `ðŸš› *Your Order is On the Way! â€” ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, your order has been dispatched from our depot in Karur.\n\n` +
    `${d.trackingNumber ? `Tracking ref: ${d.trackingNumber}\n\n` : ''}` +
    `Please ensure someone is available to receive the delivery.\n\n` +
    `Payment due on delivery: â‚¹${d.total.toLocaleString('en-IN')}\n\n` +
    `â€” Karur Plywood & Company ðŸ­`,

  delivered: (d) =>
    `ðŸ“¦ *Order Delivered â€” ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, we hope your order was delivered in perfect condition!\n\n` +
    `If you notice any damage or issue, please reply here within 48 hours with photos.\n\n` +
    `Rate your experience: ${SITE_URL}/products\n\n` +
    `Thank you for shopping with Karur Plywood & Company! ðŸ™`,

  cancelled: (d) =>
    `âŒ *Order Cancelled â€” ${d.orderNumber}*\n\n` +
    `Hi ${d.customerName}, your order has been cancelled.\n\n` +
    `${d.adminNotes ? `Reason: ${d.adminNotes}\n\n` : ''}` +
    `If a payment was made, a refund will be processed within 5-7 business days.\n\n` +
    `Need help? Call us: +91 91596 66538\n` +
    `â€” Karur Plywood & Company`,
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

  // â”€â”€ Option A: Meta WhatsApp Business API (if token is configured) â”€â”€
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

  // â”€â”€ Option B: No API token â€” log the message so it's visible in Vercel logs â”€â”€
  // Owner can copy-paste or set up the API later.
  console.log(`[whatsapp] STATUS UPDATE for ${data.customerPhone} (${status}):\n${message}`);
  return { ok: true, method: 'skipped' };
}


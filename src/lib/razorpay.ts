// src/lib/razorpay.ts
// Thin wrapper around Razorpay's Payment Links REST API. Uses plain fetch —
// no `razorpay` npm package needed, keeps the dependency footprint small.
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

function authHeader() {
  const token = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
  return `Basic ${token}`;
}

export interface CreatePaymentLinkParams {
  orderId: string;         // your internal order id -> reference_id
  orderNumber: string;
  amountRupees: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  expiryMinutes: number;
  callbackUrl: string;     // where Razorpay redirects after payment
}

export interface RazorpayPaymentLink {
  id: string;
  short_url: string;
  status: string;
  expire_by: number;
}

export async function createRazorpayPaymentLink(
  params: CreatePaymentLinkParams
): Promise<RazorpayPaymentLink> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  const expireBy = Math.floor(Date.now() / 1000) + params.expiryMinutes * 60;

  const res = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      'Authorization': authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(params.amountRupees * 100), // paise
      currency: 'INR',
      description: `Order ${params.orderNumber} — Karur Plywood & Company`,
      customer: {
        name: params.customerName,
        contact: params.customerPhone,
        email: params.customerEmail || undefined,
      },
      notify: { sms: true, email: !!params.customerEmail },
      reminder_enable: false,
      expire_by: expireBy,
      reference_id: params.orderId,
      callback_url: params.callbackUrl,
      callback_method: 'get',
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Razorpay payment link creation failed (${res.status}): ${body}`);
  }

  return res.json();
}

/**
 * Verifies the `X-Razorpay-Signature` header on incoming webhook requests.
 * Razorpay signs the raw request body with HMAC-SHA256 using the webhook
 * secret configured in the Razorpay dashboard (Settings -> Webhooks).
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false; // length mismatch etc.
  }
}

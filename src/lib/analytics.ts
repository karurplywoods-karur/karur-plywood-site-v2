// src/lib/analytics.ts
// Central analytics module — GA4 + WhatsApp conversion tracking

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// ── PAGE VIEW ──────────────────────────────────────────────
export function pageview(url: string) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_ID, { page_path: url });
}

// ── GENERIC EVENT ──────────────────────────────────────────
export function event(
  action: string,
  params: Record<string, string | number | boolean | undefined> = {}
) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, params);
}

// ── TYPED EVENTS ───────────────────────────────────────────

export type WASource = 'product_card' | 'cart' | 'floating_button' | 'widget' | 'enquiry_form';

export interface WAClickParams {
  source: WASource;
  product_name?: string;
  category?: string;
  quantity?: number;
  total_value?: number;
}

/** Fire GA4 whatsapp_click event */
export function trackWAClick(params: WAClickParams) {
  event('whatsapp_click', {
    source: params.source,
    product_name: params.product_name,
    category: params.category,
    quantity: params.quantity,
    value: params.total_value,
    currency: 'INR',
  });
}

/** Fire GA4 view_product event */
export function trackViewProduct(params: {
  product_id: string;
  product_name: string;
  category?: string;
  price?: number;
}) {
  event('view_product', {
    item_id: params.product_id,
    item_name: params.product_name,
    item_category: params.category,
    price: params.price,
    currency: 'INR',
  });
}

/** Fire GA4 add_to_cart event */
export function trackAddToCart(params: {
  product_id: string;
  product_name: string;
  category?: string;
  price?: number;
  quantity: number;
}) {
  event('add_to_cart', {
    currency: 'INR',
    value: (params.price || 0) * params.quantity,
    item_id: params.product_id,
    item_name: params.product_name,
    item_category: params.category,
    price: params.price,
    quantity: params.quantity,
  });
}

/**
 * Fire GA4 'purchase' event — the conversion event Google Ads imports for
 * Smart Bidding optimization. Fires regardless of payment method (COD or
 * Razorpay), since the order is confirmed either way once it's created.
 * transaction_id MUST be unique per order to avoid GA4 de-duplicating
 * distinct orders, and should never be re-fired for the same order_number
 * (e.g. on page refresh).
 */
export function trackPurchase(params: {
  order_number: string;
  value: number;
  payment_method: 'cod' | 'razorpay';
  items: Array<{
    product_id: string | number;
    product_name: string;
    category?: string;
    price: number;
    quantity: number;
  }>;
}) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'purchase', {
    transaction_id: params.order_number,
    value: params.value,
    currency: 'INR',
    payment_method: params.payment_method,
    items: params.items.map((i) => ({
      item_id: i.product_id,
      item_name: i.product_name,
      item_category: i.category,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

// ── SUPABASE TRACKING HELPER ────────────────────────────────
/** Generate a UUID v4 for tracking_id (browser-safe) */
export function generateTrackingId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

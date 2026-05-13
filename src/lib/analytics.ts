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

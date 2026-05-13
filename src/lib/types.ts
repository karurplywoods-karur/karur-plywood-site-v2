// src/lib/types.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  category_id: string | null;
  description: string;
  image_url: string;
  type: 'project' | 'quick';
  price: number | null;
  unit: string;
  in_stock: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joined
  categories?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ── BADGE TYPES ─────────────────────────────────────────────

export type BadgeType =
  | 'best_seller'
  | 'fast_moving'
  | 'used_in_projects'
  | 'low_stock'
  | 'in_stock'
  | 'new';

export interface ProductBadge {
  type: BadgeType;
  label: string;
  emoji: string;
  color: string;
  textColor: string;
}

// ── TRACKING TYPES ───────────────────────────────────────────

export type WASource =
  | 'product_card'
  | 'cart'
  | 'floating_button'
  | 'widget'
  | 'enquiry_form';

export interface WATrackingPayload {
  source: WASource;
  product_name?: string;
  category?: string;
  quantity?: number;
  total_value?: number;
  tracking_id?: string;
}

export interface EnquiryPayload {
  name: string;
  phone: string;
  location?: string;
  product?: string;
  message?: string;
  tracking_id?: string;
  source?: string;
  wa_source?: WASource;
  product_name?: string;
  category?: string;
  quantity?: number;
  total_value?: number;
}

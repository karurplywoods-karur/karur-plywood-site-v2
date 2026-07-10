// src/lib/types.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
}

export interface ProductVariant {
  id: string;
  product_id: string | number;
  sku: string;
  slug: string | null;
  thickness: string;
  size: string;
  grade: string;
  finish: string;
  color: string;
  pack_size: string;
  attributes: Record<string, unknown>;
  price: number | null;
  mrp: number | null;
  stock_quantity: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'made_to_order';
  is_default: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  // Core — exist in DB before our migration
  id: string | number;          // DB uses integer (serial), not uuid
  slug?: string;                // pSEO slug field present in DB
  name: string;
  category_id: string | number | null;
  brand_id?: string | number | null;
  brand?: string | null;        // legacy text field in DB alongside brand_id FK
  description: string;
  image_url: string;
  price: number | null;
  mrp: number | null;           // added by PRODUCTS_SCHEMA_FIX.sql
  sort_order: number;
  series?: string;
  grade?: string;
  thickness?: string;           // legacy column on products table
  size?: string;                // legacy column on products table
  search_keywords?: string[];
  application_tags?: string[];
  created_at: string;
  updated_at?: string;

  // Added by PRODUCTS_SCHEMA_FIX.sql
  type: 'project' | 'quick';
  unit: string;
  in_stock: boolean;
  is_active?: boolean;          // original DB column — kept alongside in_stock

  // Joined relations
  categories?: Category;
  brands?: Brand | null;
  product_variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface ProductReview {
  id: string;
  product_id: string | number;
  variant_id: string | null;
  customer_id: string | null;
  customer_name: string;
  rating: number;
  title: string;
  body: string;
  photo_urls: string[];
  verified_purchase: boolean;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  customer_id?: string;
  product_id: string | number;
  variant_id?: string | null;
  product?: Product;
  variant?: ProductVariant | null;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  city: string;
  slug: string;
  pincodes: string[];
  is_available: boolean;
  estimate: string;
  min_order: number;
  notes: string;
  sort_order: number;
}

export interface ComparisonSet {
  id: string;
  slug: string;
  title: string;
  product_ids: Array<string | number>;
  variant_ids: string[];
  seo_title: string;
  seo_description: string;
  published: boolean;
}

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

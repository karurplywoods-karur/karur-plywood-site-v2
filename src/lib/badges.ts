// src/lib/badges.ts
// Deterministic badge assignment — no randomness, derives from product fields.

import type { Product, ProductBadge, BadgeType } from './types';

const BADGE_CONFIG: Record<BadgeType, Omit<ProductBadge, 'type'>> = {
  best_seller: {
    label: 'Best Seller',
    emoji: '🔥',
    color: 'rgba(239,68,68,0.15)',
    textColor: '#FCA5A5',
  },
  fast_moving: {
    label: 'Fast Moving',
    emoji: '⚡',
    color: 'rgba(234,179,8,0.15)',
    textColor: '#FDE047',
  },
  used_in_projects: {
    label: 'Used in Projects',
    emoji: '🏗️',
    color: 'rgba(59,130,246,0.15)',
    textColor: '#93C5FD',
  },
  low_stock: {
    label: 'Low Stock',
    emoji: '⚠️',
    color: 'rgba(249,115,22,0.15)',
    textColor: '#FDBA74',
  },
  in_stock: {
    label: 'In Stock',
    emoji: '✅',
    color: 'rgba(34,197,94,0.15)',
    textColor: '#86EFAC',
  },
  new: {
    label: 'New Arrival',
    emoji: '🆕',
    color: 'rgba(168,85,247,0.15)',
    textColor: '#D8B4FE',
  },
};

export function makeBadge(type: BadgeType): ProductBadge {
  return { type, ...BADGE_CONFIG[type] };
}

/**
 * Deterministically derive a primary badge for a product.
 * Priority: low_stock > best_seller > fast_moving > used_in_projects > new > in_stock
 *
 * Rules (no randomness — repeatable for same product):
 * - "new"            : created within last 14 days
 * - "best_seller"    : sort_order === 1 and type === 'project'
 * - "fast_moving"    : sort_order === 1 and type === 'quick'
 * - "used_in_projects": category is plywood/doors/laminates + sort_order <= 3
 * - "low_stock"      : product name contains keywords like "last", "limited"
 *                      OR we use a hash of the product ID (stable, not random)
 */
export function getProductBadge(product: Product): ProductBadge | null {
  if (!product.in_stock) return null; // out of stock — no badge

  const nameLower = product.name.toLowerCase();
  const catSlug = product.categories?.slug || '';
  const ageMs = Date.now() - new Date(product.created_at).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  // New arrival — created within 14 days
  if (ageDays < 14) return makeBadge('new');

  // Low stock — name contains hint words
  if (nameLower.includes('limited') || nameLower.includes('last')) {
    return makeBadge('low_stock');
  }

  // Best seller — top project product per category
  if (product.type === 'project' && product.sort_order === 1) {
    return makeBadge('best_seller');
  }

  // Fast moving — top quick-order product
  if (product.type === 'quick' && product.sort_order === 1) {
    return makeBadge('fast_moving');
  }

  // Used in projects — major construction categories, top items
  const constructionCats = ['plywood', 'doors', 'laminates'];
  if (constructionCats.includes(catSlug) && product.sort_order <= 3) {
    return makeBadge('used_in_projects');
  }

  // Fast moving — all quick items rank 2–4
  if (product.type === 'quick' && product.sort_order <= 4) {
    return makeBadge('fast_moving');
  }

  // Default in_stock badge for remaining items
  return makeBadge('in_stock');
}

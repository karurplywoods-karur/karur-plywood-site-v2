'use client';
// src/lib/useRecentlyViewed.ts
// Tracks products the visitor has viewed, stored in localStorage.
// Max 8 items, most recent first, current product excluded from display.

import { useEffect, useState } from 'react';
import type { Product } from './types';

const KEY     = 'karur-plywood-recently-viewed';
const MAX     = 8;

export function useRecentlyViewed(currentProduct?: Product) {
  const [items, setItems] = useState<Product[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Record current product view
  useEffect(() => {
    if (!currentProduct) return;
    try {
      const saved = localStorage.getItem(KEY);
      const existing: Product[] = saved ? JSON.parse(saved) : [];
      // Remove if already there, add to front, cap at MAX
      const updated = [
        currentProduct,
        ...existing.filter(p => p.id !== currentProduct.id),
      ].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(updated));
      setItems(updated);
    } catch {}
  }, [currentProduct?.id]);

  // Return items excluding the current product
  const displayed = currentProduct
    ? items.filter(p => p.id !== currentProduct.id)
    : items;

  return displayed;
}


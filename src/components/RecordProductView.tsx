'use client';
// src/components/RecordProductView.tsx
// Thin client component that records the current product in recently-viewed history.
// Rendered inside the server product detail page.

import { useEffect } from 'react';
import type { Product } from '@/lib/types';

const KEY = 'karur-plywood-recently-viewed';
const MAX = 8;

export default function RecordProductView({ product }: { product: Product }) {
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      const existing: Product[] = saved ? JSON.parse(saved) : [];
      const updated = [
        product,
        ...existing.filter(p => p.id !== product.id),
      ].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch {}
  }, [product.id]);

  return null; // renders nothing
}

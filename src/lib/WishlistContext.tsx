'use client';
// src/lib/WishlistContext.tsx
// Wishlist stored in localStorage â€” no login required.
// Follows the same pattern as CartContext.

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import type { Product } from './types';

interface WishlistCtx {
  items: Product[];
  add:    (product: Product) => void;
  remove: (productId: string | number) => void;
  toggle: (product: Product) => void;
  has:    (productId: string | number) => boolean;
  count:  number;
  clear:  () => void;
}

const WishlistContext = createContext<WishlistCtx | null>(null);
const WISHLIST_KEY = 'karur-plywood-wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WISHLIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setReady(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((product: Product) => {
    setItems(prev => prev.find(p => p.id === product.id) ? prev : [...prev, product]);
  }, []);

  const remove = useCallback((productId: string | number) => {
    setItems(prev => prev.filter(p => p.id !== productId));
  }, []);

  const toggle = useCallback((product: Product) => {
    setItems(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const has = useCallback((productId: string | number) => {
    return items.some(p => p.id === productId);
  }, [items]);

  const clear = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{ items, add, remove, toggle, has, count: items.length, clear }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}


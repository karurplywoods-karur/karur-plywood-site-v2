'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import type { CartItem, Product, ProductVariant } from './types';

interface CartCtx {
  items: CartItem[];
  add: (product: Product, variant?: ProductVariant) => void;
  inc: (product: Product, variant?: ProductVariant) => void;
  dec: (product: Product, variant?: ProductVariant) => void;
  setQty: (product: Product, qty: number, variant?: ProductVariant) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx | null>(null);
const CART_STORAGE_KEY = 'karur-plywood-cart';

function itemKey(product: Product, variant?: ProductVariant | null) {
  return `${product.id}:${variant?.id || 'base'}`;
}

function itemPrice(item: CartItem) {
  return item.variant?.price ?? item.product.price ?? 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(i => i?.product?.id && Number.isFinite(i?.quantity) && i.quantity > 0));
        }
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((product: Product, variant?: ProductVariant) => {
    const key = itemKey(product, variant);
    setItems(prev => {
      const exists = prev.find(i => itemKey(i.product, i.variant) === key);
      if (exists) {
        return prev.map(i => itemKey(i.product, i.variant) === key ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
  }, []);

  const inc = useCallback((product: Product, variant?: ProductVariant) => {
    const key = itemKey(product, variant);
    setItems(prev => prev.map(i => itemKey(i.product, i.variant) === key ? { ...i, quantity: i.quantity + 1 } : i));
  }, []);

  const dec = useCallback((product: Product, variant?: ProductVariant) => {
    const key = itemKey(product, variant);
    setItems(prev => {
      const item = prev.find(i => itemKey(i.product, i.variant) === key);
      if (!item) return prev;
      if (item.quantity === 1) return prev.filter(i => itemKey(i.product, i.variant) !== key);
      return prev.map(i => itemKey(i.product, i.variant) === key ? { ...i, quantity: i.quantity - 1 } : i);
    });
  }, []);

  const setQty = useCallback((product: Product, qty: number, variant?: ProductVariant) => {
    const safe = Math.max(0, Math.floor(qty));
    const key = itemKey(product, variant);
    setItems(prev => {
      if (safe === 0) return prev.filter(i => itemKey(i.product, i.variant) !== key);
      const exists = prev.find(i => itemKey(i.product, i.variant) === key);
      if (exists) return prev.map(i => itemKey(i.product, i.variant) === key ? { ...i, quantity: safe } : i);
      return [...prev, { product, variant, quantity: safe }];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, inc, dec, setQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

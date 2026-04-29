'use client';
// src/lib/CartContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Product, CartItem } from './types';

interface CartCtx {
  items: CartItem[];
  add: (p: Product) => void;
  inc: (p: Product) => void;
  dec: (p: Product) => void;
  setQty: (p: Product, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((p: Product) => {
    setItems(prev => {
      const exists = prev.find(i => i.product.id === p.id);
      if (exists) return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: p, quantity: 1 }];
    });
  }, []);

  const inc = useCallback((p: Product) => {
    setItems(prev => prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
  }, []);

  const dec = useCallback((p: Product) => {
    setItems(prev => {
      const item = prev.find(i => i.product.id === p.id);
      if (!item) return prev;
      if (item.quantity === 1) return prev.filter(i => i.product.id !== p.id);
      return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  }, []);

  // Directly set any quantity (for typed input — e.g. 200 screws)
  const setQty = useCallback((p: Product, qty: number) => {
    const safe = Math.max(0, Math.floor(qty));
    setItems(prev => {
      if (safe === 0) return prev.filter(i => i.product.id !== p.id);
      const exists = prev.find(i => i.product.id === p.id);
      if (exists) return prev.map(i => i.product.id === p.id ? { ...i, quantity: safe } : i);
      return [...prev, { product: p, quantity: safe }];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + (i.product.price || 0) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

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

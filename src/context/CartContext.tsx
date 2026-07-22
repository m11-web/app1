import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product, getCurrentPrice } from '../lib/types';

const CART_STORAGE_KEY = 'rena_cart_items';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  cartReady: boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  cartReady: false,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);

  // Load cart from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then(raw => {
        if (raw) {
          try {
            const saved: CartItem[] = JSON.parse(raw);
            setItems(saved);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setCartReady(true));
  }, []);

  // Persist cart whenever it changes (skip initial empty state before load)
  useEffect(() => {
    if (!cartReady) return;
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, cartReady]);

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock_quantity);
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i
        );
      }
      const clampedQty = Math.min(qty, product.stock_quantity);
      return [...prev, { product, quantity: clampedQty }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.product.id === productId
            ? { ...i, quantity: Math.min(qty, i.product.stock_quantity) }
            : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + getCurrentPrice(i.product) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, cartReady }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

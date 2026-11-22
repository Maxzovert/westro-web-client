"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AUTH_CHANGED_EVENT } from "@/lib/auth-events";
import { ApiError, api } from "@/lib/api";
import type { StoreCart } from "@/types/store";

type CartContextValue = {
  cart: StoreCart | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refreshCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<StoreCart>;
  updateItem: (itemId: string, quantity: number) => Promise<StoreCart>;
  removeItem: (itemId: string) => Promise<StoreCart>;
  clear: () => Promise<StoreCart>;
};

const CartContext = createContext<CartContextValue | null>(null);

const emptyCart = (): StoreCart => ({
  id: null,
  currency: "INR",
  items: [],
  itemCount: 0,
  subtotal: "0.00",
  discountTotal: "0.00",
  shippingTotal: "0.00",
  taxTotal: "0.00",
  grandTotal: "0.00",
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoreCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await api.getCart();
      setCart(next);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load cart");
      setCart((current) => current ?? emptyCart());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    function onAuthChanged() {
      void refreshCart();
    }
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  }, [refreshCart]);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    const next = await api.addCartItem({ variantId, quantity });
    setCart(next);
    setError(null);
    return next;
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const next = await api.updateCartItem(itemId, quantity);
    setCart(next);
    setError(null);
    return next;
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    const next = await api.removeCartItem(itemId);
    setCart(next);
    setError(null);
    return next;
  }, []);

  const clear = useCallback(async () => {
    const next = await api.clearCart();
    setCart(next);
    setError(null);
    return next;
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      refreshing,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, loading, error, refreshing, refreshCart, addItem, updateItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

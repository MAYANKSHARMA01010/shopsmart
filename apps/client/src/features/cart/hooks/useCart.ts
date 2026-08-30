"use client";

import { useMemo, useCallback } from "react";
import { useCartStore } from "../store/cartStore";
import type { CartItem, CartProduct } from "../types/cartSchema";

/**
 * Domain hook wrapping useCartStore with memoized selectors, derived totals,
 * and high-performance O(1) lookup helpers.
 */
export function useCart() {
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const error = useCartStore((s) => s.error);

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const items = useMemo(() => cart?.items || [], [cart?.items]);
  const totalItems = useMemo(() => cart?.totalItems ?? 0, [cart?.totalItems]);
  const subtotal = useMemo(() => cart?.subtotal ?? "0.00", [cart?.subtotal]);
  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  // Fast O(1) productId -> CartItem map
  const itemMap = useMemo(() => {
    const map = new Map<string, CartItem>();
    for (const item of items) {
      map.set(item.productId, item);
    }
    return map;
  }, [items]);

  const getItem = useCallback(
    (productId: string): CartItem | undefined => {
      return itemMap.get(productId);
    },
    [itemMap]
  );

  const isInCart = useCallback(
    (productId: string): boolean => {
      return itemMap.has(productId);
    },
    [itemMap]
  );

  const getItemQuantity = useCallback(
    (productId: string): number => {
      return itemMap.get(productId)?.quantity || 0;
    },
    [itemMap]
  );

  return {
    cart,
    items,
    totalItems,
    subtotal,
    isEmpty,
    isLoading,
    error,
    getItem,
    isInCart,
    getItemQuantity,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
  };
}

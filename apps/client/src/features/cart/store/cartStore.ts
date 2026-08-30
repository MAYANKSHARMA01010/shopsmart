import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "../services/cartService";
import { useAuthStore } from "../../auth/store/authStore";
import type { Cart, CartItem, CartProduct } from "../types/cartSchema";

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  _silentSync: () => Promise<void>;
  addItem: (product: CartProduct, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  resetCart: () => void;
}


const getEmptyCart = (): Cart => ({
  id: "guest",
  userId: "guest",
  items: [],
  totalItems: 0,
  subtotal: "0.00",
});

const computeGuestTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items
    .reduce((sum, item) => {
      if (!item.product.isVisible) return sum;
      return sum + Number.parseFloat(item.product.basePrice) * item.quantity;
    }, 0)
    .toFixed(2);
  return { totalItems, subtotal };
};

/**
 * Compute optimistic cart totals from the current items list.
 * Used to instantly reflect UI changes before the server responds.
 */
const applyOptimisticItems = (currentCart: Cart, newItems: CartItem[]): Cart => {
  const { totalItems, subtotal } = computeGuestTotals(newItems);
  return { ...currentCart, items: newItems, totalItems, subtotal };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: getEmptyCart(),
      isLoading: false,
      error: null,

      fetchCart: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const res = await cartService.getCart();
          if (res.success) {
            set({ cart: res.data });
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to fetch cart";
          set({ error: message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Silent background sync — does NOT set isLoading so UI buttons stay responsive.
      // Used by error-recovery paths (remove/update failures) to get authoritative
      // server state without blocking the user.
      _silentSync: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) return;
        try {
          const res = await cartService.getCart();
          if (res.success) set({ cart: res.data, error: null });
        } catch {
          // Silent — next explicit fetchCart will correct state
        }
      },

      addItem: async (product: CartProduct, quantity: number) => {
        const token = useAuthStore.getState().accessToken;

        if (token) {
          // ── Optimistic update: apply immediately before network call ──
          const prevCart = get().cart;
          const existingIdx = prevCart.items.findIndex((i) => i.productId === product.id);
          let optimisticItems = [...prevCart.items];

          if (existingIdx > -1) {
            const existing = optimisticItems[existingIdx];
            const newQty = Math.min(existing.quantity + quantity, product.stock, 10);
            optimisticItems[existingIdx] = { ...existing, quantity: newQty };
          } else {
            if (optimisticItems.length >= 50) {
              throw new Error("Cannot add item. Cart has reached maximum limit of 50 unique items.");
            }
            const newQty = Math.min(quantity, product.stock, 10);
            optimisticItems.push({
              id: `optimistic-${product.id}`,
              productId: product.id,
              quantity: newQty,
              product,
              warnings: [],
            });
          }

          // Apply optimistic state immediately — UI feels instant
          set({ cart: applyOptimisticItems(prevCart, optimisticItems), error: null });

          try {
            const res = await cartService.addItem(product.id, quantity);
            if (res.success) {
              // Reconcile with server truth (handles edge cases like stock limits)
              set({ cart: res.data });
            }
          } catch (err: unknown) {
            // Rollback on failure
            set({ cart: prevCart, error: err instanceof Error ? err.message : "Failed to add item" });
            throw err;
          }
        } else {
          // Guest local updates (already instant)
          const currentCart = get().cart;
          const existingItemIndex = currentCart.items.findIndex(
            (item) => item.productId === product.id
          );

          let newItems = [...currentCart.items];

          if (existingItemIndex > -1) {
            const existingItem = newItems[existingItemIndex];
            const newQty = Math.min(existingItem.quantity + quantity, product.stock, 10);

            const warnings: string[] = [];
            if (!product.isVisible) {
              warnings.push("This product is currently unavailable.");
            } else if (product.stock <= 0 || newQty > product.stock) {
              warnings.push("Requested quantity exceeds available stock.");
            }

            newItems[existingItemIndex] = { ...existingItem, quantity: newQty, warnings };
          } else {
            if (currentCart.items.length >= 50) {
              throw new Error("Cannot add item. Cart has reached maximum limit of 50 unique items.");
            }

            const newQty = Math.min(quantity, product.stock, 10);
            const warnings: string[] = [];
            if (!product.isVisible) {
              warnings.push("This product is currently unavailable.");
            } else if (product.stock <= 0 || newQty > product.stock) {
              warnings.push("Requested quantity exceeds available stock.");
            }

            newItems.push({
              id: `guest-${Math.random().toString(36).substring(2, 9)}`,
              productId: product.id,
              quantity: newQty,
              product,
              warnings,
            });
          }

          set({ cart: applyOptimisticItems(currentCart, newItems) });
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        const token = useAuthStore.getState().accessToken;

        if (token) {
          // ── Optimistic update ──
          const prevCart = get().cart;
          const itemIndex = prevCart.items.findIndex((i) => i.productId === productId);

          if (itemIndex > -1) {
            const item = prevCart.items[itemIndex];
            const newQty = Math.min(quantity, item.product.stock, 10);
            const newItems = [...prevCart.items];
            newItems[itemIndex] = { ...item, quantity: newQty };
            set({ cart: applyOptimisticItems(prevCart, newItems), error: null });
          }

          try {
            const res = await cartService.updateQuantity(productId, quantity);
            if (res.success) {
              set({ cart: res.data });
            }
          } catch {
            // Silent sync — do NOT rollback (would restore stale state).
            // Just get authoritative server state without blocking UI.
            await get()._silentSync();
          }
        } else {
          // Guest local updates
          const currentCart = get().cart;
          const itemIndex = currentCart.items.findIndex((item) => item.productId === productId);

          if (itemIndex > -1) {
            const item = currentCart.items[itemIndex];
            const stock = item.product.stock;
            const newQty = Math.min(quantity, stock, 10);

            const warnings: string[] = [];
            if (!item.product.isVisible) {
              warnings.push("This product is currently unavailable.");
            } else if (stock <= 0 || newQty > stock) {
              warnings.push("Requested quantity exceeds available stock.");
            }

            const newItems = [...currentCart.items];
            newItems[itemIndex] = { ...item, quantity: newQty, warnings };
            set({ cart: applyOptimisticItems(currentCart, newItems) });
          }
        }
      },

      removeItem: async (productId: string) => {
        const token = useAuthStore.getState().accessToken;

        if (token) {
          // ── Optimistic update: remove immediately ──
          const prevCart = get().cart;
          const newItems = prevCart.items.filter((item) => item.productId !== productId);
          set({ cart: applyOptimisticItems(prevCart, newItems), error: null });

          try {
            const res = await cartService.removeItem(productId);
            if (res.success) {
              // Reconcile with server (handles totals, discounts, etc.)
              set({ cart: res.data });
            }
          } catch {
            // Do NOT rollback to prevCart — prevCart may be stale Redis data.
            // Rolling back causes: item reappears → fetchCart empties cart → "system fucked".
            // Instead: keep optimistic state (item gone) and silently sync with server truth.
            await get()._silentSync();
          }
        } else {
          // Guest local updates
          const currentCart = get().cart;
          const newItems = currentCart.items.filter((item) => item.productId !== productId);
          set({ cart: applyOptimisticItems(currentCart, newItems) });
        }
      },

      clearCart: async () => {
        const token = useAuthStore.getState().accessToken;

        if (token) {
          const prevCart = get().cart;
          // Optimistic clear
          set({ cart: getEmptyCart(), error: null });

          try {
            const res = await cartService.clearCart();
            if (!res.success) {
              set({ cart: prevCart });
            }
          } catch (err: unknown) {
            // Rollback
            set({ cart: prevCart, error: err instanceof Error ? err.message : "Failed to clear cart" });
            throw err;
          }
        } else {
          set({ cart: getEmptyCart() });
        }
      },

      mergeGuestCart: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) return;

        const currentCart = get().cart;
        if (currentCart.items.length === 0) return;

        set({ isLoading: true, error: null });
        try {
          const guestPayload = currentCart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }));

          const res = await cartService.mergeCart(guestPayload);
          if (res.success) {
            set({ cart: res.data });
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to merge cart";
          set({ error: message });
        } finally {
          set({ isLoading: false });
        }
      },

      resetCart: () => {
        set({ cart: getEmptyCart(), error: null });
      },
    }),
    {
      name: "shopsmart-cart",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

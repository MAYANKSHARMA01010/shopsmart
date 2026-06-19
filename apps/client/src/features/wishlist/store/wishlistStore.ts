import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wishlistService } from "../services/wishlistService";
import { useAuthStore } from "../../auth/store/authStore";
import type { WishlistItem } from "../types/wishlistSchema";
import type { Product } from "../../products/types/productSchema";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  toggleItem: (product: Product) => Promise<boolean>;
  removeItem: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  resetWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchWishlist: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          // Keep local guest wishlist
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const items = await wishlistService.getWishlist();
          set({ items });
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : "Failed to fetch wishlist" });
        } finally {
          set({ isLoading: false });
        }
      },

      toggleItem: async (product: Product) => {
        const token = useAuthStore.getState().accessToken;
        const currentItems = get().items;
        const isCurrentlyWishlisted = currentItems.some((i) => i.productId === product.id);

        if (!token) {
          // Guest Mode - Local Only
          if (isCurrentlyWishlisted) {
            set({ items: currentItems.filter((i) => i.productId !== product.id) });
            return false;
          } else {
            const newItem: WishlistItem = {
              id: `guest-${Math.random().toString(36).substring(2, 9)}`,
              userId: "guest",
              productId: product.id,
              product,
              createdAt: new Date().toISOString(),
            };
            set({ items: [...currentItems, newItem] });
            return true;
          }
        }

        // Authenticated - Optimistic Update
        if (isCurrentlyWishlisted) {
          // Optimistically remove
          set({ items: currentItems.filter((i) => i.productId !== product.id) });
          try {
            await wishlistService.removeItem(product.id);
            return false;
          } catch (error) {
            // Revert on failure
            set({ items: currentItems });
            throw error;
          }
        } else {
          // Optimistically add
          const tempItem: WishlistItem = {
            id: `temp-${Date.now()}`,
            userId: "temp",
            productId: product.id,
            product,
            createdAt: new Date().toISOString(),
          };
          set({ items: [...currentItems, tempItem] });
          try {
            const serverItem = await wishlistService.addItem(product.id);
            // Replace temp with server item
            set({ items: get().items.map((i) => (i.productId === product.id ? serverItem : i)) });
            return true;
          } catch (error) {
            // Revert on failure
            set({ items: currentItems });
            throw error;
          }
        }
      },

      removeItem: async (productId: string) => {
        const token = useAuthStore.getState().accessToken;
        const currentItems = get().items;
        
        // Optimistic Remove
        set({ items: currentItems.filter((i) => i.productId !== productId) });

        if (token) {
          try {
            await wishlistService.removeItem(productId);
          } catch (error) {
            // Revert
            set({ items: currentItems });
            throw error;
          }
        }
      },

      clearWishlist: async () => {
        const token = useAuthStore.getState().accessToken;
        const currentItems = get().items;

        set({ items: [] });
        if (token) {
          try {
            await wishlistService.clearWishlist();
          } catch (error) {
            set({ items: currentItems });
            throw error;
          }
        }
      },

      resetWishlist: () => {
        set({ items: [], error: null });
      },

      isInWishlist: (productId: string) => {
        return get().items.some((i) => i.productId === productId);
      },
    }),
    {
      name: "shopsmart-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

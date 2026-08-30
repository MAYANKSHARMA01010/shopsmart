import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wishlistService } from "../services/wishlistService";
import { useAuthStore } from "../../auth/store/authStore";
import type { WishlistItem, WishlistCollection } from "../types/wishlistSchema";
import type { Product } from "../../products/types/productSchema";

export const DEFAULT_WISHLIST_COLLECTION: WishlistCollection = {
  id: "default",
  name: "My Wishlist",
  icon: "folder",
  description: "Default wishlist folder",
  createdAt: new Date().toISOString(),
};

interface WishlistState {
  items: WishlistItem[];
  collections: WishlistCollection[];
  activeCollectionId: string; // 'all' | 'default' | custom ID
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  toggleItem: (product: Product, targetCollectionId?: string) => Promise<boolean>;
  removeItem: (productId: string) => Promise<void>;
  moveToCollection: (productId: string, targetCollectionId: string) => void;
  createCollection: (name: string, icon?: string, description?: string) => WishlistCollection;
  deleteCollection: (collectionId: string) => void;
  setActiveCollection: (collectionId: string) => void;
  clearWishlist: () => Promise<void>;
  resetWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      collections: [DEFAULT_WISHLIST_COLLECTION],
      activeCollectionId: "all",
      isLoading: false,
      error: null,

      fetchWishlist: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const serverItems = await wishlistService.getWishlist();
          const currentItems = get().items || [];
          const merged = serverItems.map((sItem) => {
            const existing = currentItems.find((ci) => ci.productId === sItem.productId);
            return {
              ...sItem,
              collectionId: existing?.collectionId || "default",
            };
          });
          set({ items: merged });
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : "Failed to fetch wishlist" });
        } finally {
          set({ isLoading: false });
        }
      },

      toggleItem: async (product: Product, targetCollectionId = "default") => {
        const token = useAuthStore.getState().accessToken;
        const currentItems = get().items || [];
        const isCurrentlyWishlisted = currentItems.some((i) => i?.productId === product.id);

        if (!token) {
          // Guest Mode
          if (isCurrentlyWishlisted) {
            set({ items: currentItems.filter((i) => i?.productId !== product.id) });
            return false;
          } else {
            const newItem: WishlistItem = {
              id: `guest-${Math.random().toString(36).substring(2, 9)}`,
              userId: "guest",
              productId: product.id,
              product,
              collectionId: targetCollectionId,
              createdAt: new Date().toISOString(),
            };
            set({ items: [...currentItems, newItem] });
            return true;
          }
        }

        // Authenticated
        if (isCurrentlyWishlisted) {
          set({ items: currentItems.filter((i) => i?.productId !== product.id) });
          try {
            await wishlistService.removeItem(product.id);
            return false;
          } catch (error) {
            set({ items: currentItems });
            throw error;
          }
        } else {
          const tempItem: WishlistItem = {
            id: `temp-${Date.now()}`,
            userId: "temp",
            productId: product.id,
            product,
            collectionId: targetCollectionId,
            createdAt: new Date().toISOString(),
          };
          set({ items: [...currentItems, tempItem] });
          try {
            const serverItem = await wishlistService.addItem(product.id, targetCollectionId);
            set({
              items: get().items.map((i) =>
                i.productId === product.id ? { ...serverItem, collectionId: targetCollectionId } : i
              ),
            });
            return true;
          } catch (error) {
            set({ items: currentItems });
            throw error;
          }
        }
      },

      removeItem: async (productId: string) => {
        const token = useAuthStore.getState().accessToken;
        const currentItems = get().items || [];
        set({ items: currentItems.filter((i) => i?.productId !== productId) });

        if (token) {
          try {
            await wishlistService.removeItem(productId);
          } catch (error) {
            set({ items: currentItems });
            throw error;
          }
        }
      },

      moveToCollection: (productId: string, targetCollectionId: string) => {
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, collectionId: targetCollectionId } : item
          ),
        });
      },

      createCollection: (name: string, icon = "📁", description = "") => {
        const newCollection: WishlistCollection = {
          id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: name.trim(),
          icon: icon.trim() || "📁",
          description: description.trim(),
          createdAt: new Date().toISOString(),
        };
        const currentCollections = get().collections || [DEFAULT_WISHLIST_COLLECTION];
        set({
          collections: [...currentCollections, newCollection],
          activeCollectionId: newCollection.id,
        });
        return newCollection;
      },

      deleteCollection: (collectionId: string) => {
        if (collectionId === "default") return;
        const remaining = (get().collections || []).filter((c) => c.id !== collectionId);
        const updatedItems = (get().items || []).map((item) =>
          item.collectionId === collectionId ? { ...item, collectionId: "default" } : item
        );
        set({
          collections: remaining.length ? remaining : [DEFAULT_WISHLIST_COLLECTION],
          items: updatedItems,
          activeCollectionId: "all",
        });
      },

      setActiveCollection: (collectionId: string) => {
        set({ activeCollectionId: collectionId });
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
        set({ items: [], error: null, collections: [DEFAULT_WISHLIST_COLLECTION], activeCollectionId: "all" });
      },

      isInWishlist: (productId: string) => {
        return get().items?.some((i) => i?.productId === productId) ?? false;
      },
    }),
    {
      name: "shopsmart-wishlist",
      partialize: (state) => ({
        items: state.items,
        collections: state.collections,
        activeCollectionId: state.activeCollectionId,
      }),
    }
  )
);

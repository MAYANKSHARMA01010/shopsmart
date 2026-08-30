"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { favoritesService } from "../services/favoritesService";
import { useAuthStore } from "../../auth/store/authStore";
import type { Product } from "../../products/types/productSchema";

interface FavoritesState {
  favorites: Product[];
  isLoading: boolean;
  error: string | null;

  fetchFavorites: () => Promise<void>;
  toggleFavorite: (product: Product) => Promise<boolean>;
  removeFavorite: (productId: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      error: null,

      fetchFavorites: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const items = await favoritesService.getFavorites();
          set({ favorites: items.map((i) => i.product).filter(Boolean) });
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : "Failed to fetch favorites" });
        } finally {
          set({ isLoading: false });
        }
      },

      toggleFavorite: async (product: Product) => {
        const token = useAuthStore.getState().accessToken;
        const current = get().favorites || [];
        const exists = current.some((p) => p.id === product.id);

        if (!token) {
          // Guest mode (localStorage)
          if (exists) {
            set({ favorites: current.filter((p) => p.id !== product.id) });
            return false;
          } else {
            set({ favorites: [...current, product] });
            return true;
          }
        }

        // Authenticated mode (Optimistic update + Server sync)
        if (exists) {
          set({ favorites: current.filter((p) => p.id !== product.id) });
          try {
            await favoritesService.removeFavorite(product.id);
            return false;
          } catch (error) {
            set({ favorites: current });
            throw error;
          }
        } else {
          set({ favorites: [...current, product] });
          try {
            await favoritesService.addFavorite(product.id);
            return true;
          } catch (error) {
            set({ favorites: current });
            throw error;
          }
        }
      },

      removeFavorite: async (productId: string) => {
        const token = useAuthStore.getState().accessToken;
        const current = get().favorites || [];
        set({ favorites: current.filter((p) => p.id !== productId) });

        if (token) {
          try {
            await favoritesService.removeFavorite(productId);
          } catch (error) {
            set({ favorites: current });
            throw error;
          }
        }
      },

      clearFavorites: async () => {
        const token = useAuthStore.getState().accessToken;
        const current = get().favorites || [];
        set({ favorites: [] });

        if (token) {
          try {
            await favoritesService.clearFavorites();
          } catch (error) {
            set({ favorites: current });
            throw error;
          }
        }
      },

      isFavorite: (productId: string) => {
        return (get().favorites || []).some((p) => p.id === productId);
      },
    }),
    {
      name: "shopsmart-favorites",
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);

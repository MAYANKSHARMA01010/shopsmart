import apiClient from "@/lib/apiClient";
import type { WishlistItem } from "../types/wishlistSchema";

export const wishlistService = {
  getWishlist: async (category?: string): Promise<WishlistItem[]> => {
    const params = category && category !== "all" ? { category } : undefined;
    const res = await apiClient.get<{ data: WishlistItem[] }>("/wishlist", { params });
    return res.data.data;
  },

  addItem: async (productId: string, category = "Default"): Promise<WishlistItem> => {
    const res = await apiClient.post<{ data: WishlistItem }>(`/wishlist/${productId}`, { category });
    return res.data.data;
  },

  removeItem: async (productId: string, category?: string): Promise<void> => {
    const params = category ? { category } : undefined;
    await apiClient.delete(`/wishlist/${productId}`, { params });
  },

  clearWishlist: async (category?: string): Promise<void> => {
    const params = category ? { category } : undefined;
    await apiClient.delete("/wishlist", { params });
  },
};

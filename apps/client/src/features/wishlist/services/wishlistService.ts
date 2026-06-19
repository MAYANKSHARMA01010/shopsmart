import apiClient from "@/lib/apiClient";
import type { WishlistItem } from "../types/wishlistSchema";

export const wishlistService = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const res = await apiClient.get<{ data: WishlistItem[] }>("/wishlist");
    return res.data.data;
  },

  addItem: async (productId: string): Promise<WishlistItem> => {
    const res = await apiClient.post<{ data: WishlistItem }>(`/wishlist/${productId}`);
    return res.data.data;
  },

  removeItem: async (productId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${productId}`);
  },

  clearWishlist: async (): Promise<void> => {
    await apiClient.delete("/wishlist");
  },
};

import apiClient from "../../../lib/apiClient";
import type { Product } from "../../products/types/productSchema";

export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export const favoritesService = {
  async getFavorites(): Promise<FavoriteItem[]> {
    const res = await apiClient.get<{ data: FavoriteItem[] }>("/favorites");
    return res.data.data;
  },

  async addFavorite(productId: string): Promise<FavoriteItem> {
    const res = await apiClient.post<{ data: FavoriteItem }>(`/favorites/${productId}`);
    return res.data.data;
  },

  async removeFavorite(productId: string): Promise<void> {
    await apiClient.delete(`/favorites/${productId}`);
  },

  async clearFavorites(): Promise<void> {
    await apiClient.delete("/favorites");
  },
};

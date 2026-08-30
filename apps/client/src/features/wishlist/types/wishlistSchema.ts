import { Product } from "../../products/types/productSchema";

export interface WishlistCollection {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  collectionId?: string; // 'favorites' or custom collection UUID/ID
  createdAt: string;
}

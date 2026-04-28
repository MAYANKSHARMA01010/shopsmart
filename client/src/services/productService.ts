import apiClient from "./apiClient";
import type { Product, ProductData } from "../schemas/productSchema";

export const productService = {
  getAll: (params?: { category?: string; search?: string }): Promise<Product[]> => 
    apiClient.get("/products", { params }),

  getById: (id: number): Promise<Product> => 
    apiClient.get(`/products/${id}`),

  create: (data: ProductData): Promise<Product> => 
    apiClient.post("/products", data),

  update: (id: number, data: Partial<ProductData>): Promise<Product> => 
    apiClient.put(`/products/${id}`, data),

  delete: (id: number): Promise<{ message: string }> => 
    apiClient.delete(`/products/${id}`),

  checkHealth: (): Promise<{ status: string; message: string; timestamp: string }> => 
    apiClient.get("/health"),
};

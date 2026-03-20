import type { Product, ProductFormData, HealthStatus } from "@/types";

import { API_CONFIG } from "@/configs/api";

const API_URL = API_CONFIG.BASE_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthStatus>("/api/health"),

  products: {
    list: (params?: { category?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.append("category", params.category);
      if (params?.search) searchParams.append("search", params.search);
      
      const qs = searchParams.toString();
      const url = qs ? `/api/products?${qs}` : "/api/products";
      return request<Product[]>(url);
    },

    get: (id: number) => request<Product>(`/api/products/${id}`),

    create: (data: ProductFormData) =>
      request<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          price: Number.parseFloat(data.price),
          stock: Number.parseInt(data.stock, 10) || 0,
        }),
      }),

    update: (id: number, data: Partial<ProductFormData>) =>
      request<Product>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      request<{ message: string }>(`/api/products/${id}`, {
        method: "DELETE",
      }),
  },
};

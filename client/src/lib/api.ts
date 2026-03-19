import type { Product, ProductFormData, HealthStatus } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
      const qs = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => !!v) as [string, string][]
      ).toString();
      return request<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
    },

    get: (id: number) => request<Product>(`/api/products/${id}`),

    create: (data: ProductFormData) =>
      request<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          stock: parseInt(data.stock) || 0,
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

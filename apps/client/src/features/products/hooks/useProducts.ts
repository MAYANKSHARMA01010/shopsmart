import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { productService } from "../services/productService";
import type { Product, ProductData } from "../types/productSchema";

export function useProducts(filters: { search?: string; category?: string; minPrice?: string; maxPrice?: string; sort?: string; page?: string; limit?: string }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);

  const queryKey = [
    "products",
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    filters.page,
    filters.limit,
  ];

  const { data, isLoading: loading, error, refetch: refresh } = useQuery({
    queryKey,
    queryFn: async () => {
      return await productService.getAll({
        search: filters.search || undefined,
        category: filters.category !== "all" ? filters.category : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sort: filters.sort || undefined,
        page: filters.page || "1",
        limit: filters.limit || "12",
      });
    },
  });

  const addMutation = useMutation({
    mutationFn: (newProduct: ProductData) => productService.create(newProduct),
    onSuccess: (response) => {
      // Invalidate the cache to instantly refetch products
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSuccess(`"${response.data.name}" has been added successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSuccess("Product deleted.");
      setTimeout(() => setSuccess(null), 2000);
    },
  });

  const addProduct = async (productData: ProductData): Promise<Product | undefined> => {
    try {
      const result = await addMutation.mutateAsync(productData);
      return result.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      throw err;
    }
  };

  return {
    products: data?.data || [],
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    total: data?.total || 0,
    loading,
    error: error instanceof Error ? error.message : null,
    success,
    adding: addMutation.isPending,
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
    addProduct,
    deleteProduct,
    refresh,
  };
}

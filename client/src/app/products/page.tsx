"use client";

import { useEffect, useState, useCallback } from "react";
import type { Product, ProductFormData } from "@/types";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ProductForm } from "@/components/ProductForm";

const CATEGORIES = [
  "all",
  "electronics",
  "clothing",
  "food",
  "books",
  "sports",
  "toys",
  "beauty",
  "home",
  "tools",
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.products.list({
        search: search || undefined,
        category: category !== "all" ? category : undefined,
      });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  async function handleAddProduct(data: ProductFormData) {
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      const product = await api.products.create(data);
      setProducts((prev) => [product, ...prev]);
      setSuccess(`"${product.name}" has been added successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteProduct(id: number) {
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Product deleted.");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const inStock = products.filter((p) => p.stock > 0).length;

  return (
    <div className="container">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Products</h1>
          <p>
            {loading
              ? "Loading…"
              : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      {/* Stats */}
      {!loading && products.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{products.length}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{inStock}</div>
            <div className="stat-label">In Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">${totalValue.toLocaleString("en", { maximumFractionDigits: 0 })}</div>
            <div className="stat-label">Inventory Value</div>
          </div>
        </div>
      )}

      {/* Add product form */}
      <ProductForm onSubmit={handleAddProduct} loading={adding} />

      {/* Alerts */}
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          type="search"
          placeholder="🔍 Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Products */}
      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner" />
          <p>Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>No products found</h3>
          <p>
            {search || category !== "all"
              ? "Try adjusting your filters."
              : "Use the form above to add your first product."}
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct}
              deleting={deletingId === product.id}
            />
          ))}
        </div>
      )}

      <div style={{ paddingBottom: "3rem" }} />
    </div>
  );
}

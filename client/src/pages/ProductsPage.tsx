"use client";

import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ProductForm } from "@/components/ProductForm";

const CATEGORIES = [
  "all", "electronics", "clothing", "food", "books", "sports", "toys", "beauty", "home", "tools",
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const {
    products,
    loading,
    error,
    success,
    adding,
    deletingId,
    addProduct,
    deleteProduct,
  } = useProducts({ search, category });

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const inStock = products.filter((p) => p.stock > 0).length;

  return (
    <div className="container">
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

      <ProductForm onSubmit={addProduct} loading={adding} />

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

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
              onDelete={deleteProduct}
              deleting={deletingId === product.id}
            />
          ))}
        </div>
      )}

      <div style={{ paddingBottom: "3rem" }} />
    </div>
  );
}

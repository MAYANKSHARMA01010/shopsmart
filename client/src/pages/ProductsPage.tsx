"use client";

import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ProductForm } from "@/components/ProductForm";

const CATEGORIES = [
  "all", "electronics", "clothing", "food", "books",
  "sports", "toys", "beauty", "home", "tools",
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
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Products</h1>
          <p>
            {loading
              ? "Loading catalog…"
              : `${products.length} product${products.length !== 1 ? "s" : ""} in catalog`}
          </p>
        </div>
      </div>

      {/* Stats — only shown when products exist */}
      {!loading && products.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">📦</div>
            <div className="stat-value">{products.length}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">✓</div>
            <div className="stat-value">{inStock}</div>
            <div className="stat-label">In Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">$</div>
            <div className="stat-value">
              ${totalValue.toLocaleString("en", { maximumFractionDigits: 0 })}
            </div>
            <div className="stat-label">Inventory Value</div>
          </div>
        </div>
      )}

      {/* Add Product form */}
      <ProductForm onSubmit={addProduct} loading={adding} />

      {/* Alerts */}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          id="product-search"
          className="filter-search"
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
        <select
          id="category-filter"
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all"
                ? "All Categories"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Products list / loading / empty */}
      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner" aria-hidden="true" />
          <p>Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">🛒</div>
          <h3>No products found</h3>
          <p>
            {search || category !== "all"
              ? "Try adjusting your search or filters."
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

      <div style={{ paddingBottom: "var(--space-16)" }} />
    </div>
  );
}

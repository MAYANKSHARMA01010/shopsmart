"use client";

import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useAuth } from "@/features/auth";
import {
  useProducts,
  useProductsFilter,
  ProductCard,
  formatPrice,
  type ProductData,
} from "@/features/products";
import { CategoryFilter } from "@/features/categories";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";


// Lazy-load the heavy ProductForm so customer users never download admin form code
const LazyProductForm = lazy(() =>
  import("@/features/products/components/ProductForm").then((mod) => ({ default: mod.ProductForm }))
);

function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconRupee() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6" y1="3" x2="18" y2="3" />
      <line x1="6" y1="8" x2="18" y2="8" />
      <path d="M6 13l8.5 8" />
      <path d="M6 13h3a4 4 0 0 0 0-8" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ProductsPageContent() {
  const {
    state: filterState,
    dispatch: dispatchFilter,
    urlParams,
    isFiltered,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
    handleReset,
  } = useProductsFilter();

  const [showForm, setShowForm] = useState(false);

  const {
    products,
    loading,
    error,
    success,
    adding,
    deletingId,
    page,
    totalPages,
    total,
    addProduct,
    deleteProduct,
  } = useProducts({
    search: urlParams.search,
    category: urlParams.category,
    minPrice: urlParams.minPrice,
    maxPrice: urlParams.maxPrice,
    sort: urlParams.sort,
    page: urlParams.page,
  });

  const { user } = useAuth();
  const canAddProduct = user && ["SUPER_ADMIN", "ADMIN", "VENDOR"].includes(user.role);

  // Memoized calculations — avoid re-computations when products don't change
  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + parseFloat(formatPrice(p.basePrice)) * p.stock, 0),
    [products]
  );
  const inStock = useMemo(
    () => products.filter((p) => p.stock > 0).length,
    [products]
  );

  const handleAddProduct = useCallback(
    async (data: ProductData) => {
      const result = await addProduct(data);
      if (result) setShowForm(false);
    },
    [addProduct]
  );

  return (
    <div className="container" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-16)" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, margin: "0 0 var(--space-1)", color: "var(--color-text-primary)" }}>
            Product Catalog
          </h1>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            {loading
              ? "Loading catalog…"
              : `Showing ${products.length} of ${total} products`}
          </p>
        </div>

        {canAddProduct && (
          <button
            id="add-product-toggle"
            type="button"
            className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
            onClick={() => setShowForm((v) => !v)}
            aria-expanded={showForm}
            style={{ height: "42px", padding: "0 20px" }}
          >
            {showForm ? <><IconMinus /> Cancel</> : <><IconPlus /> Add Product</>}
          </button>
        )}
      </div>

      {/* Stats Strip (For Admins / Vendors) */}
      {canAddProduct && !loading && total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          <div className="profile-section-card" style={{ padding: "var(--space-4) var(--space-5)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "var(--color-primary-surface)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBox />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>TOTAL PRODUCTS</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{total}</div>
            </div>
          </div>

          <div className="profile-section-card" style={{ padding: "var(--space-4) var(--space-5)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "var(--color-success-surface)", color: "var(--color-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconCheckCircle />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>IN STOCK</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{inStock}</div>
            </div>
          </div>

          <div className="profile-section-card" style={{ padding: "var(--space-4) var(--space-5)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "var(--color-accent-surface, rgba(166, 82, 26, 0.1))", color: "var(--color-accent, #A6521A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconRupee />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>INVENTORY VALUE</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && <div className="form-error-banner" role="alert" style={{ marginBottom: "var(--space-4)" }}>{error}</div>}
      {success && <div className="alert alert-success" role="status" style={{ marginBottom: "var(--space-4)" }}>{success}</div>}

      {/* Filter & Search Toolbar */}
      <div
        className="profile-section-card"
        style={{
          padding: "var(--space-4) var(--space-5)",
          marginBottom: "var(--space-8)",
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          alignItems: "center",
        }}
      >
        {/* Search input with icon */}
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: "200px" }}>
          <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none", display: "flex" }}>
            <IconSearch />
          </div>
          <input
            id="product-search"
            type="search"
            placeholder="Search products by name or keyword…"
            className="form-input"
            style={{ paddingLeft: "38px", height: "42px" }}
            value={filterState.search}
            onChange={(e) => dispatchFilter({ type: "SET_SEARCH", payload: e.target.value })}
            aria-label="Search products"
          />
        </div>

        {/* Category filter dropdown */}
        <div style={{ flex: "0 1 180px", minWidth: "140px" }}>
          <CategoryFilter
            id="category-filter"
            className="form-input"
            value={filterState.category}
            onChange={handleCategoryChange}
            includeAll
          />
        </div>

        {/* Sort dropdown */}
        <div style={{ flex: "0 1 180px", minWidth: "140px" }}>
          <select
            className="form-input"
            value={filterState.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort products"
            style={{ height: "42px" }}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Price Range Inputs */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: "0 1 auto" }}>
          <input
            type="number"
            placeholder="Min ₹"
            value={filterState.minPrice}
            onChange={(e) => dispatchFilter({ type: "SET_MIN_PRICE", payload: e.target.value })}
            className="form-input"
            style={{ width: "88px", height: "42px" }}
            aria-label="Minimum Price"
          />
          <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>–</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={filterState.maxPrice}
            onChange={(e) => dispatchFilter({ type: "SET_MAX_PRICE", payload: e.target.value })}
            className="form-input"
            style={{ width: "88px", height: "42px" }}
            aria-label="Maximum Price"
          />
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            style={{ height: "42px", padding: "0 16px", fontSize: "0.85rem" }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading Skeleton via component */}
      {loading ? (
        <ProductGridSkeleton count={6} />
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>

          {isFiltered ? (
            <>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: "var(--space-2) 0" }}>No products match your filters</h2>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>Try adjusting your search or price range to find what you are looking for.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Clear all filters
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: "var(--space-2) 0" }}>No products in catalog yet</h2>
              <p style={{ color: "var(--color-text-muted)" }}>Create your first product to start managing your inventory.</p>
              {canAddProduct && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                  style={{ marginTop: "var(--space-4)" }}
                >
                  Add First Product
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        /* Product Grid */
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={deleteProduct}
                deleting={deletingId === product.id}
                canManage={!!canAddProduct}
                priority={idx < 4}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "var(--space-3)", marginTop: "var(--space-10)" }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                style={{ padding: "8px 18px", fontSize: "0.875rem" }}
              >
                ← Previous
              </button>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-secondary)", padding: "0 8px" }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                style={{ padding: "8px 18px", fontSize: "0.875rem" }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Lazy Add Product form */}
      {showForm && canAddProduct && (
        <div id="add" className="form-reveal" style={{ marginTop: "var(--space-8)" }}>
          <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading Form…</div>}>
            <LazyProductForm onSubmit={handleAddProduct} loading={adding} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "3rem 0" }}><ProductGridSkeleton count={6} /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}

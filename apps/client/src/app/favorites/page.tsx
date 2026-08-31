"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";
import { useFavoritesStore } from "@/features/favorites";
import { useCartStore } from "@/features/cart";
import { ProductImage } from "@/features/products";
import { formatPrice, type Product } from "@/features/products";


function IconHeartFilled() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function FavoritesPage() {
  const {
    favorites,
    isLoading,
    error,
    fetchFavorites,
    removeFavorite,
    clearFavorites,
  } = useFavoritesStore();

  const { addItem: addToCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isMoving, setIsMoving] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchFavorites();
  }, [fetchFavorites]);

  const handleMoveToCart = async (product: Product) => {
    setIsMoving(product.id);
    const cartProduct = {
      ...product,
      basePrice: String(product.basePrice),
      comparePrice: product.comparePrice != null ? String(product.comparePrice) : null,
    };
    try {
      await addToCart(cartProduct as unknown as Parameters<typeof addToCart>[0], 1);
      await removeFavorite(product.id);
    } catch (err) {
      console.error("Failed to move favorite to cart", err);
    } finally {
      setIsMoving(null);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }} aria-busy="true">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
          <div>
            <Skeleton width={120} height={16} style={{ marginBottom: "var(--space-2)" }} />
            <Skeleton width={200} height={32} style={{ marginBottom: "var(--space-2)" }} />
            <Skeleton width={300} height={14} />
          </div>
          <Skeleton width={80} height={20} />
        </div>
        <ProductGridSkeleton count={4} />
      </div>
    );
  }


  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#e63946", marginBottom: "var(--space-1)" }}>
            <IconHeartFilled />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Quick Likes
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
            My Favorites
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            All items you loved with one click. Saved together in one place without folders.
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>
            {favorites.length} {favorites.length === 1 ? "Item" : "Items"}
          </span>
          {favorites.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFavorites}
              style={{ fontSize: "0.85rem", padding: "8px 14px" }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="form-error-banner" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {error}
        </div>
      )}

      {/* Grid or Empty State */}
      {favorites.length === 0 ? (
        <div
          style={{
            padding: "var(--space-16) var(--space-4)",
            textAlign: "center",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", margin: "0 0 var(--space-2)" }}>
            Your Favorites List is Empty
          </h2>
          <p style={{ color: "var(--color-text-secondary)", margin: "0 0 var(--space-6)", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
            Tap the heart icon on any product while browsing to instantly save your favorite finds here.
          </p>
          <Link href="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {favorites.map((product) => {
            const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.basePrice);
            return (
              <article
                key={product.id}
                className="product-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", height: "220px", background: "var(--color-surface-sunken)" }}>
                  <Link href={`/products/${product.id}`} style={{ display: "block", width: "100%", height: "100%" }}>
                    <ProductImage src={product.images?.[0]} alt={product.name} fill sizes="280px" />
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFavorite(product.id)}
                    title="Remove from Favorites"
                    aria-label="Remove from Favorites"
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(253, 252, 250, 0.9)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid rgba(230, 57, 70, 0.4)",
                      borderRadius: "50%",
                      width: "34px",
                      height: "34px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#e63946",
                      boxShadow: "0 2px 8px rgba(28, 25, 22, 0.08)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <IconHeartFilled />
                  </button>

                  {hasDiscount && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "var(--color-error)",
                        color: "#fff",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      SALE
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column" }}>
                  {product.category && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--space-1)" }}>
                      {product.category.name}
                    </span>
                  )}
                  <h3 style={{ fontSize: "1rem", margin: "0 0 var(--space-2)", lineHeight: 1.4, fontWeight: 600 }}>
                    <Link href={`/products/${product.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {product.name}
                    </Link>
                  </h3>

                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-text-primary)" }}>
                        ₹{formatPrice(product.basePrice)}
                      </span>
                      {hasDiscount && (
                        <span style={{ textDecoration: "line-through", color: "var(--color-text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
                          ₹{formatPrice(product.comparePrice!)}
                        </span>
                      )}
                    </div>

                    {product.stock === 0 && (
                      <span style={{ fontSize: "0.75rem", color: "var(--color-error)", fontWeight: 600 }}>
                        Out of stock
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={isMoving === product.id || product.stock === 0}
                      onClick={() => handleMoveToCart(product)}
                      style={{ flex: 1, height: "38px", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <IconCart />
                      <span>{isMoving === product.id ? "Moving…" : product.stock === 0 ? "Out of Stock" : "Move to Cart"}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeFavorite(product.id)}
                      title="Remove"
                      style={{ width: "38px", height: "38px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

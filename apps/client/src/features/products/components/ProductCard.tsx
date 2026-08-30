"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatPrice, type Product } from "../types/productSchema";
import { FavoriteButton } from "@/features/favorites";
import { WishlistButton } from "@/features/wishlist";
import { useCart } from "@/features/cart";
import { useUI } from "@/context/UIContext";


interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
  deleting?: boolean;
  canManage?: boolean;
  priority?: boolean;
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

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function getStockClass(stock: number): string {
  if (stock === 0) return "out-stock";
  if (stock < 5) return "low-stock";
  return "in-stock";
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onDelete,
  deleting = false,
  canManage = false,
  priority = false,
}: ProductCardProps) {
  const { addItem, updateQuantity, removeItem, getItemQuantity, isInCart, isLoading } = useCart();
  const { openQuickView } = useUI();

  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = useCallback(async () => {
    try {
      setAdding(true);
      const cartProduct = {
        ...product,
        basePrice: String(product.basePrice),
        comparePrice: product.comparePrice != null ? String(product.comparePrice) : null,
      };
      await addItem(cartProduct as any, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }, [addItem, product]);

  const stockLabel = useMemo(() => {
    if (product.stock === 0) return "Out of stock";
    if (canManage) {
      if (product.stock < 5) return `Low stock — ${product.stock} left`;
      return `${product.stock} in stock`;
    }
    if (product.stock < 5) return `Only ${product.stock} left!`;
    return null;
  }, [product.stock, canManage]);

  const formattedPrice = useMemo(() => formatPrice(product.basePrice), [product.basePrice]);
  const formattedComparePrice = useMemo(
    () => (product.comparePrice != null ? formatPrice(product.comparePrice) : null),
    [product.comparePrice]
  );

  return (
    <article className="product-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Product Image Container */}
      <div className="product-image" style={{ position: "relative", overflow: "hidden" }}>
        <Link href={`/products/${product.id}`} style={{ display: "block", width: "100%", height: "100%", position: "relative" }}>
          <OptimizedImage
            src={product.images?.[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 280px"
          />
        </Link>

        {/* Quick View Button */}
        <button
          type="button"
          onClick={() => openQuickView(product)}
          aria-label={`Quick view ${product.name}`}
          className="quick-view-btn"
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(4px)",
            color: "var(--color-text-primary, #0f172a)",
            border: "1px solid var(--color-border, #e2e8f0)",
            borderRadius: "var(--radius-full, 9999px)",
            padding: "6px 14px",
            fontSize: "0.75rem",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.15s ease",
          }}
        >
          <IconEye /> Quick View
        </button>

        {/* Favorite Heart Button */}
        <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}>
          <FavoriteButton product={product} />
        </div>
      </div>

      {/* Body */}
      <div className="product-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {product.category && (
          <span className="product-category">{product.category.name}</span>
        )}
        <h2 className="product-name" style={{ fontSize: "1rem", lineHeight: 1.4, margin: "0 0 var(--space-2)" }}>
          <Link href={`/products/${product.id}`} style={{ color: "inherit", textDecoration: "none" }}>
            {product.name}
          </Link>
        </h2>
        {product.description && (
          <p className="product-desc" style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: "0 0 var(--space-3)" }}>
            {product.description}
          </p>
        )}

        {/* Footer: price + stock */}
        <div className="product-footer" style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--space-2)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              className="product-price"
              aria-label={`Price: ₹${formattedPrice}`}
              style={{ fontFamily: "var(--font-mono)", fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)" }}
            >
              ₹{formattedPrice}
            </span>
            {formattedComparePrice && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  textDecoration: "line-through",
                }}
              >
                ₹{formattedComparePrice}
              </span>
            )}
          </div>

          {stockLabel && (
            <span
              className={`product-stock ${getStockClass(product.stock)}`}
              aria-label={stockLabel}
            >
              {stockLabel}
            </span>
          )}
        </div>
      </div>

      {/* Actions: Add to Cart + Wishlist Bookmark */}
      <div className="product-actions" style={{ padding: "0 var(--space-5) var(--space-5)", display: "flex", gap: "8px", alignItems: "center" }}>
        {canManage && onDelete ? (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(product.id)}
            disabled={deleting}
            aria-label={`Delete ${product.name}`}
            style={{ width: "100%", height: "38px" }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        ) : inCart ? (
          <>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-sm)", overflow: "hidden", height: "38px", flex: 1, justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => {
                  if (cartQuantity <= 1) {
                    removeItem(product.id);
                  } else {
                    updateQuantity(product.id, cartQuantity - 1);
                  }
                }}
                disabled={isLoading}
                style={{ padding: "0 14px", background: "transparent", color: "var(--color-primary)", border: "none", cursor: "pointer", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}
              >
                −
              </button>
              <div style={{ padding: "0 8px", flex: 1, textAlign: "center", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
                {cartQuantity}
              </div>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                disabled={cartQuantity >= product.stock || isLoading}
                style={{ padding: "0 14px", background: "transparent", color: cartQuantity >= product.stock ? "var(--color-text-muted)" : "var(--color-primary)", border: "none", cursor: cartQuantity >= product.stock ? "not-allowed" : "pointer", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}
              >
                +
              </button>
            </div>
            <WishlistButton product={product} variant="icon" />
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0 || justAdded}
              aria-label={`Add ${product.name} to Cart`}
              style={{
                flex: 1,
                height: "38px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                ...(justAdded ? { backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" } : {}),
              }}
            >
              <IconCart />
              <span>{adding ? "Adding…" : justAdded ? "✓ Added!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
            </button>
            <WishlistButton product={product} variant="icon" />
          </>
        )}
      </div>
    </article>
  );
});

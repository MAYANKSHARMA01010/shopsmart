"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/features/cart/hooks/useCart";
import { useClickOutside } from "@/hooks/useClickOutside";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatPrice } from "../types/productSchema";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";
import toast from "react-hot-toast";

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function QuickViewModal() {
  const { quickViewProduct, closeQuickView } = useUI();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const modalRef = useClickOutside<HTMLDivElement>(closeQuickView, !!quickViewProduct);

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!quickViewProduct) return null;

  const inCart = isInCart(quickViewProduct.id);
  const currentCartQty = getItemQuantity(quickViewProduct.id);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      const cartProduct = {
        ...quickViewProduct,
        basePrice: String(quickViewProduct.basePrice),
        comparePrice: quickViewProduct.comparePrice != null ? String(quickViewProduct.comparePrice) : null,
      };
      await addItem(cartProduct as any, quantity);
      toast.success(`Added ${quantity} × ${quickViewProduct.name} to cart`);
      closeQuickView();
    } catch (err: any) {
      toast.error(err.message || "Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        ref={modalRef}
        className="profile-section-card"
        style={{
          width: "100%",
          maxWidth: "760px",
          backgroundColor: "var(--color-surface, #ffffff)",
          borderRadius: "var(--radius-xl, 16px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 0,
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeQuickView}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 10,
            background: "var(--color-surface-subtle, #f1f5f9)",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-text-primary)",
            transition: "background-color 0.15s ease",
          }}
        >
          <IconClose />
        </button>

        {/* Product Image preview */}
        <div style={{ position: "relative", height: "360px", backgroundColor: "var(--color-surface-subtle)" }}>
          <OptimizedImage
            src={quickViewProduct.images?.[0]}
            alt={quickViewProduct.name}
            fill
            priority
            objectFit="cover"
          />
          <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 5, display: "flex", gap: "8px" }}>
            <FavoriteButton product={quickViewProduct} />
            <WishlistButton product={quickViewProduct} variant="icon" />
          </div>
        </div>

        {/* Product Details & Actions */}
        <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {quickViewProduct.category && (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-primary)",
                  display: "inline-block",
                  marginBottom: "var(--space-2)",
                }}
              >
                {quickViewProduct.category.name}
              </span>
            )}
            <h2
              id="quickview-title"
              style={{
                fontSize: "1.25rem",
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
                margin: "0 0 var(--space-2)",
                lineHeight: 1.3,
              }}
            >
              {quickViewProduct.name}
            </h2>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", margin: "var(--space-3) 0" }}>
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-primary)",
                }}
              >
                ₹{formatPrice(quickViewProduct.basePrice)}
              </span>
              {quickViewProduct.comparePrice && (
                <span
                  style={{
                    fontSize: "0.95rem",
                    textDecoration: "line-through",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  ₹{formatPrice(quickViewProduct.comparePrice)}
                </span>
              )}
            </div>

            {quickViewProduct.description && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                  margin: "0 0 var(--space-4)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {quickViewProduct.description}
              </p>
            )}

            {/* Stock indicator */}
            <div style={{ marginBottom: "var(--space-4)", fontSize: "0.85rem" }}>
              {quickViewProduct.stock > 0 ? (
                <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                  ✓ In Stock ({quickViewProduct.stock} available)
                </span>
              ) : (
                <span style={{ color: "var(--color-error)", fontWeight: 600 }}>
                  ✕ Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div>
            {quickViewProduct.stock > 0 && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "var(--space-3)" }}>
                {/* Quantity input */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      padding: "8px 12px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(quickViewProduct.stock, 10, q + 1))}
                    style={{
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || quickViewProduct.stock === 0}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: 600,
                  }}
                >
                  <IconCart />
                  <span>{adding ? "Adding…" : inCart ? `Add More (${currentCartQty} in cart)` : "Add to Cart"}</span>
                </button>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "var(--space-2)" }}>
              <Link
                href={`/products/${quickViewProduct.id}`}
                onClick={closeQuickView}
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                View Full Product Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlistStore } from "../../../features/wishlist/store/wishlistStore";
import { useCartStore } from "../../../features/cart/store/cartStore";
import { ProductCard } from "../../../features/products/components/ProductCard";
import type { Product } from "../../../features/products/types/productSchema";

export default function WishlistPage() {
  const { items: rawItems, isLoading, error, fetchWishlist, clearWishlist, removeItem } = useWishlistStore();
  const items = rawItems || [];
  const { addItem: addToCart } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [isMoving, setIsMoving] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToCart = async (product: Product) => {
    setIsMoving(product.id);
    const cartProduct = {
      ...product,
      basePrice: String(product.basePrice),
      comparePrice: product.comparePrice != null ? String(product.comparePrice) : null,
    };
    try {
      await addToCart(cartProduct, 1);
      await removeItem(product.id);
    } catch (err) {
      console.error("Failed to move item to cart", err);
    } finally {
      setIsMoving(null);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Loading Wishlist...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div className="page-header-left">
          <h2 style={{ margin: 0 }}>My Wishlist</h2>
          <p>
            {isLoading
              ? "Loading..."
              : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearWishlist}
          >
            Empty Wishlist
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: "2rem" }}>
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love so you don&apos;t lose track of them.</p>
          <div className="empty-state-actions">
            <Link href="/products" className="btn btn-primary">
              Explore Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="products-grid">
          {items.map((item) => (
            <div key={item.id} style={{ position: "relative", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <ProductCard
                product={item.product}
                deleting={false}
                onDelete={() => {}} // Disabling default delete if present in ProductCard because wishlist handles it differently
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => handleMoveToCart(item.product)}
                  disabled={isMoving === item.product.id || item.product.stock <= 0}
                >
                  {isMoving === item.product.id ? "Moving..." : "Move to Cart"}
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => removeItem(item.product.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

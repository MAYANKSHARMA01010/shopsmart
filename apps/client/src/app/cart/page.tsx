"use client";

import { useEffect, useState, useMemo, useCallback, useSyncExternalStore } from "react";


import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { CartPageSkeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/features/cart";
import { formatPrice } from "@/features/products";

import { useRouter } from "next/navigation";


function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconShoppingBag() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { cart, items, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);


  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number.parseFloat(String(item.product.basePrice)) * item.quantity,
      0
    );
  }, [items]);

  const totalItemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const shipping = useMemo(() => (subtotal >= 500 || subtotal === 0 ? 0 : 99), [subtotal]);
  const discount = useMemo(() => (promoApplied ? Math.round(subtotal * 0.1) : 0), [promoApplied, subtotal]);
  const total = useMemo(() => Math.max(0, subtotal - discount + shipping), [subtotal, discount, shipping]);

  if (!mounted || isLoading) {
    return <CartPageSkeleton />;
  }



  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
            Shopping Cart
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            {items.length === 0 ? "Your cart is empty" : `${totalItemCount} item${totalItemCount !== 1 ? "s" : ""} in your cart`}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => clearCart()}
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "6px 14px" }}
          >
            Empty Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="profile-section-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ marginBottom: "var(--space-4)", display: "flex", justifyContent: "center" }}>
            <IconShoppingBag />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "var(--space-2)", color: "var(--color-text-primary)" }}>
            Your cart is empty
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)", fontSize: "0.95rem" }}>
            Discover our curated artisanal products and add your favorites to get started.
          </p>
          <Link href="/products" className="btn btn-primary" style={{ padding: "10px 24px" }}>
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "var(--space-6)", alignItems: "start" }}>
          {/* Cart Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {items.map((item) => {
              const itemTotal = Number.parseFloat(String(item.product.basePrice)) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="profile-section-card"
                  style={{
                    display: "flex",
                    gap: "var(--space-4)",
                    padding: "var(--space-4)",
                    alignItems: "center",
                  }}
                >
                  {/* Product thumbnail */}
                  <Link
                    href={`/products/${item.productId}`}
                    style={{
                      flexShrink: 0,
                      display: "block",
                      position: "relative",
                      width: "110px",
                      height: "110px",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      background: "var(--color-surface-sunken)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <OptimizedImage
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      fill
                      sizes="110px"
                    />
                  </Link>

                  {/* Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)" }}>
                      <div>
                        {(item.product as { category?: { name: string } }).category && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: "var(--color-primary)",
                              background: "var(--color-primary-surface)",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full)",
                              display: "inline-block",
                              marginBottom: "4px",
                            }}
                          >
                            {(item.product as { category?: { name: string } }).category?.name}
                          </span>
                        )}
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--color-text-primary)" }}>
                          <Link href={`/products/${item.productId}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {item.product.name}
                          </Link>
                        </h2>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                          ₹{formatPrice(item.product.basePrice)} each
                        </div>
                      </div>

                      {/* Total for this line */}
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-text-primary)" }}>
                        ₹{formatPrice(itemTotal)}
                      </div>
                    </div>

                    {/* Quantity controls & Remove */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-1)" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                          background: "var(--color-surface)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeItem(item.productId);
                            } else {
                              updateQuantity(item.productId, item.quantity - 1);
                            }
                          }}
                          disabled={isLoading}
                          aria-label="Decrease quantity"
                          style={{
                            padding: "4px 12px",
                            background: "transparent",
                            border: "none",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            fontSize: "1rem",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderLeft: "1px solid var(--color-border)",
                            borderRight: "1px solid var(--color-border)",
                            minWidth: "36px",
                            textAlign: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || isLoading}
                          aria-label="Increase quantity"
                          style={{
                            padding: "4px 12px",
                            background: "transparent",
                            border: "none",
                            cursor: item.quantity >= item.product.stock || isLoading ? "not-allowed" : "pointer",
                            fontSize: "1rem",
                            color: item.quantity >= item.product.stock ? "var(--color-text-muted)" : "var(--color-text-primary)",
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "var(--color-error)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                        }}
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <IconTrash /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary */}
          <div
            className="profile-section-card"
            style={{
              padding: "var(--space-6)",
              position: "sticky",
              top: "80px",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: 0, paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
              Order Summary
            </h2>

            {/* Price breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>Subtotal ({totalItemCount} items)</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", fontWeight: 600 }}>
                  ₹{formatPrice(subtotal)}
                </span>
              </div>

              {promoApplied && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-success)" }}>
                  <span>Discount (10% OFF)</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    -₹{formatPrice(discount)}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>Shipping</span>
                <span style={{ fontFamily: "var(--font-mono)", color: shipping === 0 ? "var(--color-success)" : "var(--color-text-primary)", fontWeight: 600 }}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              {subtotal < 500 && subtotal > 0 && (
                <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", margin: 0 }}>
                  Add ₹{formatPrice(500 - subtotal)} more for Free Shipping!
                </p>
              )}
            </div>

            {/* Promo Code Input */}
            <div style={{ display: "flex", gap: "var(--space-2)", paddingTop: "var(--space-2)" }}>
              <input
                type="text"
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="form-input"
                style={{ flex: 1, textTransform: "uppercase", fontSize: "0.85rem" }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (promoCode.trim().toUpperCase() === "SMART10") {
                    setPromoApplied(true);
                  }
                }}
                style={{ fontSize: "0.85rem", padding: "0 16px" }}
              >
                Apply
              </button>
            </div>

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "var(--space-3)",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <div>
                <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>
                  Estimated Total
                </span>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Inclusive of all taxes</div>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.4rem", color: "var(--color-text-primary)" }}>
                ₹{formatPrice(total)}
              </span>
            </div>

            {/* Proceed to Checkout button */}
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="btn btn-primary"
              style={{ width: "100%", height: "48px", fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)" }}
            >
              Proceed to Checkout →
            </button>

            {/* Trust Badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                <IconShield /> <span>Razorpay 256-bit Secure Checkout</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                <IconTruck /> <span>Fast Express Delivery across India</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

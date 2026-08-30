import React, { useMemo } from "react";
import { useCart } from "@/features/cart";
import { useCheckoutStore } from "../store/checkoutStore";
import { formatPrice } from "@/features/products";


export const OrderSummary: React.FC = () => {
  const { cart, items } = useCart();
  const { couponCode } = useCheckoutStore();

  const subtotal = useMemo(() => Number.parseFloat(cart.subtotal) || 0, [cart.subtotal]);
  const discount = useMemo(() => (couponCode ? Math.round(subtotal * 0.1) : 0), [couponCode, subtotal]);
  const taxableAmount = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);
  const tax = useMemo(() => taxableAmount * 0.10, [taxableAmount]); // 10% GST
  const shipping = useMemo(() => (subtotal >= 500 || subtotal === 0 ? 0 : 50), [subtotal]);
  const total = useMemo(() => taxableAmount + tax + shipping, [taxableAmount, tax, shipping]);


  return (
    <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: 0, paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
        Order Summary
      </h2>

      {/* Item preview list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", margin: "var(--space-4) 0", maxHeight: "220px", overflowY: "auto" }}>
        {cart.items.map((item) => (
          <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "0.875rem" }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{item.product.name}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>Qty: {item.quantity}</div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-text-primary)" }}>
              ₹{formatPrice(Number.parseFloat(String(item.product.basePrice)) * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border)", fontSize: "0.875rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
          <span>Subtotal</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            ₹{formatPrice(subtotal)}
          </span>
        </div>

        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-success)" }}>
            <span>Discount ({couponCode})</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              -₹{formatPrice(discount)}
            </span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
          <span>Tax (10% GST)</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            ₹{formatPrice(tax)}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
          <span>Shipping</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: shipping === 0 ? "var(--color-success)" : "var(--color-text-primary)" }}>
            {shipping === 0 ? "FREE" : `₹${formatPrice(shipping)}`}
          </span>
        </div>
      </div>

      {/* Total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "var(--space-4)",
          paddingTop: "var(--space-3)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>Total</span>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.4rem", color: "var(--color-primary)" }}>
          ₹{formatPrice(total)}
        </span>
      </div>
    </div>
  );
};

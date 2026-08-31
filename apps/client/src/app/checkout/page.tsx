"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { AddressSelector, CouponInput, OrderSummary, PaymentButton, useCheckoutStore } from "@/features/checkout";
import { useCartStore } from "@/features/cart";

import { useAuthStore } from "../../features/auth/store/authStore";
import { useRouter } from "next/navigation";

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export const CheckoutPage: React.FC = () => {
  const { cart } = useCartStore();
  const token = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const resetCheckout = useCheckoutStore((state) => state.reset);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    resetCheckout();
    if (token) {
      useCartStore.getState().fetchCart();
    }
  }, [resetCheckout, token]);


  if (!mounted) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading Checkout…
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: "5rem 0", textAlign: "center" }}>
        <div className="profile-section-card" style={{ maxWidth: "480px", margin: "0 auto", padding: "3rem 2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", marginBottom: "var(--space-3)", color: "var(--color-text-primary)" }}>
            Your cart is empty
          </h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
            Add items to your cart before proceeding to checkout.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-16)" }}>
      {/* Header title */}
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 700, margin: "0 0 var(--space-4)", color: "var(--color-text-primary)" }}>
        Checkout
      </h1>

      {/* Progress Stepper */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-8)",
          fontSize: "0.875rem",
          fontWeight: 600,
        }}
      >
        <Link href="/cart" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", textDecoration: "none" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <IconCheck />
          </span>
          <span style={{ fontWeight: 600 }}>1. Cart</span>
        </Link>
        <div style={{ height: "2px", width: "48px", background: "var(--color-primary)", margin: "0 var(--space-3)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", fontWeight: 700 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            2
          </span>
          <span>2. Delivery & Payment</span>
        </div>
        <div style={{ height: "2px", width: "48px", background: "var(--color-border)", margin: "0 var(--space-3)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-muted)", fontWeight: 500 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "var(--color-surface-sunken)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            3
          </span>
          <span>3. Confirmation</span>
        </div>
      </div>

      {/* Sign-in prompt for guest users */}
      {!token && (
        <div style={{ background: "var(--color-primary-surface)", border: "1px solid var(--color-primary-border)", borderRadius: "var(--radius-lg)", padding: "14px 20px", marginBottom: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
              Already have a ShopSmart account?
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              Sign in to use your saved addresses and access faster checkout.
            </div>
          </div>
          <Link href="/login?redirect=/checkout" className="btn btn-primary btn-sm" style={{ padding: "8px 18px" }}>
            Sign In to Checkout
          </Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "var(--space-6)", alignItems: "start" }}>
        {/* Left Column: Address & Coupons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <AddressSelector />
          <CouponInput />
        </div>

        {/* Right Column: Order Summary & Pay */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", position: "sticky", top: "80px" }}>
          <OrderSummary />
          <PaymentButton />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.78rem", color: "var(--color-text-muted)", textAlign: "center" }}>
            <IconLock /> <span>Secured by Razorpay • 256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

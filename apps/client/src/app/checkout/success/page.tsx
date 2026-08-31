"use client";

import React, { Suspense, useMemo } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";


function IconCheck() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("orderId");
  const orderId = rawOrderId || "ORD-CONFIRMED";

  const formattedDelivery = useMemo(() => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    return deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, []);


  return (
    <div className="container" style={{ padding: "var(--space-12) var(--space-4)", display: "flex", justifyContent: "center" }}>
      <div
        className="profile-section-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "var(--space-8)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-5)",
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-primary-surface)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconCheck />
        </div>

        {/* Title & confirmation text */}
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, margin: "0 0 var(--space-2)", color: "var(--color-text-primary)" }}>
            Order Confirmed!
          </h1>
          <p style={{ color: "var(--color-text-secondary)", margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}>
            Thank you for your purchase. We&apos;ve sent a confirmation email with all details and tracking info.
          </p>
        </div>

        {/* Details Card */}
        <div
          style={{
            width: "100%",
            background: "var(--color-surface-sunken)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5)",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                ORDER NUMBER
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                {orderId}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                PAYMENT METHOD
              </span>
              <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                Razorpay Secured
              </span>
            </div>
          </div>

          <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-1) 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                ESTIMATED DELIVERY
              </span>
              <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                {formattedDelivery}
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--color-text-muted)", fontWeight: 400 }}>
                  (3–4 business days)
                </span>
              </span>
            </div>

            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                DELIVERING TO
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.4, display: "block" }}>
                Mayank Sharma<br />
                Indiranagar, Bengaluru - 560038
              </span>
            </div>
          </div>
        </div>

        {/* Order Step Timeline */}
        <div style={{ width: "100%", padding: "var(--space-2) 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            {/* Connecting line */}
            <div style={{ position: "absolute", top: "8px", left: "10%", right: "10%", height: "2px", background: "var(--color-border)", zIndex: 1 }} />
            <div style={{ position: "absolute", top: "8px", left: "10%", width: "25%", height: "2px", background: "var(--color-primary)", zIndex: 2 }} />

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 3, background: "var(--color-surface)", padding: "0 6px" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-primary)" }}>Placed</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 3, background: "var(--color-surface)", padding: "0 6px" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid var(--color-border)", background: "var(--color-surface)" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Processing</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 3, background: "var(--color-surface)", padding: "0 6px" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid var(--color-border)", background: "var(--color-surface)" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Shipped</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 3, background: "var(--color-surface)", padding: "0 6px" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid var(--color-border)", background: "var(--color-surface)" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Delivered</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "var(--space-3)", width: "100%", marginTop: "var(--space-2)" }}>
          <Link href="/profile/orders" className="btn btn-primary" style={{ flex: 1, padding: "12px", textAlign: "center" }}>
            View in My Orders
          </Link>
          <Link href="/products" className="btn btn-secondary" style={{ flex: 1, padding: "12px", textAlign: "center" }}>
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "var(--space-12) var(--space-4)", display: "flex", justifyContent: "center" }} aria-busy="true">
          <div className="profile-section-card" style={{ maxWidth: "600px", width: "100%", padding: "var(--space-8)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
            <Skeleton width={72} height={72} borderRadius="var(--radius-full)" />
            <Skeleton width={220} height={28} />
            <Skeleton width={320} height={16} />
            <Skeleton width="100%" height={100} borderRadius="var(--radius-md)" />
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}


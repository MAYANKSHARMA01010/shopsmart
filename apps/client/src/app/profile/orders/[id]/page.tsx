"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { OrderDetailSkeleton } from "@/components/ui/Skeleton";
import { orderService } from "@/features/orders";
import type { Order } from "@/features/orders";
import { formatPrice } from "@/features/products";
import { ProductImage } from "@/features/products";


interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "DELIVERED":
      return { bg: "var(--color-success-surface)", color: "var(--color-success)", border: "var(--color-success-border)" };
    case "SHIPPED":
    case "PROCESSING":
      return { bg: "var(--color-primary-surface)", color: "var(--color-primary)", border: "var(--color-primary-border)" };
    case "CANCELLED":
      return { bg: "var(--color-error-surface)", color: "var(--color-error)", border: "var(--color-error-border)" };
    default:
      return { bg: "var(--color-surface-sunken)", color: "var(--color-text-secondary)", border: "var(--color-border)" };
  }
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getOrderById(id);
        setOrder(response.data.order);
      } catch (err: unknown) {
        const msg = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? err.message : "Failed to load order details";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }


  if (error || !order) {
    return (
      <div className="profile-section-card" style={{ padding: "3rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-error)", marginBottom: "var(--space-2)" }}>Order Not Found</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>{error || "We couldn't find the requested order."}</p>
        <Link href="/profile/orders" className="btn btn-primary">
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const badge = getStatusBadge(order.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Back Link */}
      <div>
        <Link href="/profile/orders" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          ← Back to Orders
        </Link>
      </div>

      {/* Header Banner */}
      <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              ORDER DETAILS
            </span>
            <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", fontWeight: 700, margin: "4px 0", color: "var(--color-text-primary)" }}>
              #{order.id}
            </h1>
            <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <span
            style={{
              padding: "4px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--space-5)", alignItems: "start" }}>
        {/* Left: Items List */}
        <div className="profile-section-card" style={{ overflow: "hidden" }}>
          <div className="profile-section-header">
            <h2 className="profile-section-title">Items in Order ({order.items.length})</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {order.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                  padding: "var(--space-4) var(--space-5)",
                  borderBottom: "1px solid var(--color-border)",
                  alignItems: "center",
                }}
              >
                <Link
                  href={`/products/${item.productId}`}
                  style={{
                    position: "relative",
                    width: "70px",
                    height: "70px",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    background: "var(--color-surface-sunken)",
                    border: "1px solid var(--color-border)",
                    flexShrink: 0,
                    display: "block",
                  }}
                >
                  <ProductImage
                    src={item.product?.images?.[0]}
                    alt={item.product?.name ?? "Product"}
                    fill
                    sizes="70px"
                  />
                </Link>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0, color: "var(--color-text-primary)" }}>
                    <Link href={`/products/${item.productId}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {item.product?.name || "Product"}
                    </Link>
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                    Qty: {item.quantity} × ₹{formatPrice(item.price)}
                  </div>
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>
                  ₹{formatPrice(Number.parseFloat(String(item.price)) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary & Address */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Summary Card */}
          <div className="profile-section-card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: "0 0 var(--space-3)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
              Payment Summary
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>Subtotal</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  ₹{formatPrice(order.totalAmount)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>Shipping</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-success)" }}>FREE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-border)", fontWeight: 700 }}>
                <span>Total Paid</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", color: "var(--color-primary)" }}>
                  ₹{formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          {order.address && (
            <div className="profile-section-card" style={{ padding: "var(--space-5)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: "0 0 var(--space-3)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
                Delivery Address
              </h2>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "4px" }}>
                  {order.address.fullName || "Customer"}
                </div>
                <div>{order.address.street}</div>
                <div>{order.address.city}, {order.address.state} {order.address.zipCode}</div>
                <div>{order.address.country}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

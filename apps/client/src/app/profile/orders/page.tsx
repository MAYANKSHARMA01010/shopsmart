"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "../../../features/orders/services/orderService";
import type { Order } from "../../../features/orders/types/orderSchema";
import { formatPrice } from "../../../features/products/types/productSchema";
import { ProductImage } from "../../../features/products/components/ProductImage";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        setOrders(response.data.orders || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load orders";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading orders…
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-section-card" style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-error)", marginBottom: "var(--space-2)" }}>Unable to Load Orders</h2>
        <p style={{ color: "var(--color-text-muted)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "var(--space-6)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
            My Orders
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)" }}>📦</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: "0 0 var(--space-2)", color: "var(--color-text-primary)" }}>
            No orders yet
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-4)", fontSize: "0.9rem" }}>
            When you purchase items, your order history will appear here.
          </p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    padding: "var(--space-4) var(--space-5)",
                    background: "var(--color-surface-sunken)",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                  }}
                >
                  <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        ORDER ID
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                        {order.id.slice(0, 16)}…
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        DATE
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        TOTAL
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                        ₹{formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.72rem",
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

                    <Link
                      href={`/profile/orders/${order.id}`}
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ padding: "var(--space-4) var(--space-5)", display: "flex", gap: "var(--space-4)", overflowX: "auto" }}>
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: "220px" }}>
                      <div
                        style={{
                          position: "relative",
                          width: "54px",
                          height: "54px",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                          background: "var(--color-surface-sunken)",
                          border: "1px solid var(--color-border)",
                          flexShrink: 0,
                        }}
                      >
                        <ProductImage
                          src={item.product?.images?.[0]}
                          alt={item.product?.name ?? "Product"}
                          fill
                          sizes="54px"
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-primary)" }}>
                          {item.product?.name || "Unknown Product"}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div style={{ display: "flex", alignItems: "center", color: "var(--color-text-muted)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      +{order.items.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

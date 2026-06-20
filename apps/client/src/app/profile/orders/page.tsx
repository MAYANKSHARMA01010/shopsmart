"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "../../../features/orders/services/orderService";
import type { Order } from "../../../features/orders/types/orderSchema";
import { formatPrice } from "../../../features/products/types/productSchema";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        setOrders(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Loading Orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h2 style={{ color: "var(--color-danger)" }}>Oops!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem", margin: 0 }}>My Orders</h2>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--color-surface)", borderRadius: "var(--radius-lg)" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            <line x1="16" y1="4" x2="16" y2="20"></line><line x1="8" y1="4" x2="8" y2="20"></line><line x1="4" y1="12" x2="20" y2="12"></line>
          </svg>
          <h3>No orders yet</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>You haven&apos;t placed any orders.</p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.5rem", background: "var(--color-background)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Order ID</div>
                  <div style={{ fontWeight: 600 }}>{order.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Date</div>
                  <div style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Total</div>
                  <div style={{ fontWeight: 600 }}>${formatPrice(order.totalAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Status</div>
                  <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.875rem", fontWeight: 600, background: order.status === "DELIVERED" ? "rgba(16, 185, 129, 0.1)" : "var(--color-background)", color: order.status === "DELIVERED" ? "var(--color-success)" : "var(--color-text)", border: `1px solid ${order.status === "DELIVERED" ? "var(--color-success)" : "var(--color-border)"}` }}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <Link href={`/orders/${order.id}`} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                    View Details
                  </Link>
                </div>
              </div>
              <div style={{ padding: "1.5rem", display: "flex", gap: "1rem", overflowX: "auto" }}>
                {order.items.slice(0, 4).map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "250px" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--color-background)", flexShrink: 0 }}>
                      {item.product?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No Image</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product?.name || "Unknown Product"}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div style={{ display: "flex", alignItems: "center", paddingLeft: "1rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                    +{order.items.length - 4} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "../../../../features/orders/services/orderService";
import type { Order } from "../../../../features/orders/types/orderSchema";
import { formatPrice } from "../../../../features/products/types/productSchema";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
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
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Loading Order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h2 style={{ color: "var(--color-danger)" }}>Oops!</h2>
        <p>{error || "Order not found"}</p>
        <Link href="/orders" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <Link href="/orders" style={{ color: "var(--color-text-muted)", textDecoration: "none", display: "inline-block", marginBottom: "2rem" }}>
        &larr; Back to Orders
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0" }}>Order #{order.id}</h1>
          <div style={{ color: "var(--color-text-muted)" }}>
            Placed on {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div>
          <span style={{ display: "inline-block", padding: "0.5rem 1rem", borderRadius: "99px", fontSize: "0.875rem", fontWeight: 600, background: order.status === "DELIVERED" ? "rgba(16, 185, 129, 0.1)" : "var(--color-background)", color: order.status === "DELIVERED" ? "var(--color-success)" : "var(--color-text)", border: `1px solid ${order.status === "DELIVERED" ? "var(--color-success)" : "var(--color-border)"}` }}>
            Status: {order.status}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem", alignItems: "start" }}>
        {/* Left: Items List */}
        <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border)", fontWeight: 600, fontSize: "1.125rem" }}>
            Items in your order
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: "1.5rem", padding: "1.5rem", borderBottom: "1px solid var(--color-border)" }}>
                <Link href={`/products/${item.productId}`} style={{ flexShrink: 0, display: "block", position: "relative", width: "80px", height: "80px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--color-background)" }}>
                  {item.product?.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No Image</div>
                  )}
                </Link>
                
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                    <div>
                      <Link href={`/products/${item.productId}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>
                        {item.product?.name || "Unknown Product"}
                      </Link>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        Qty: {item.quantity} x ${formatPrice(item.price)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      ${formatPrice(Number.parseFloat(String(item.price)) * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary & Address */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ padding: "1.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <h2 style={{ fontSize: "1.125rem", margin: "0 0 1rem 0" }}>Order Summary</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Subtotal</span>
              <span>${formatPrice(order.totalAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Shipping</span>
              <span>$0.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--color-border)", fontWeight: 600, fontSize: "1.125rem" }}>
              <span>Total</span>
              <span>${formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {order.address && (
            <div style={{ padding: "1.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <h2 style={{ fontSize: "1.125rem", margin: "0 0 1rem 0" }}>Shipping Address</h2>
              <div style={{ lineHeight: 1.5, color: "var(--color-text-muted)" }}>
                <div><strong>{order.address.fullName || "Customer"}</strong></div>
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

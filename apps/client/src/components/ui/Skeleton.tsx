"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({
  className = "",
  style,
  width,
  height,
  borderRadius = "var(--radius-md, 8px)",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-base ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? "16px",
        borderRadius,
        backgroundColor: "var(--color-surface-subtle, #f1f5f9)",
        backgroundImage:
          "linear-gradient(90deg, var(--color-surface-subtle, #f1f5f9) 0%, var(--color-border, #e2e8f0) 50%, var(--color-surface-subtle, #f1f5f9) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite linear",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

// ─── Product Card & Grid Skeletons ────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div
      className="profile-section-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 0,
        overflow: "hidden",
        background: "var(--color-surface, #ffffff)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg, 12px)",
      }}
      aria-hidden="true"
    >
      <Skeleton height={220} borderRadius={0} />
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
        <Skeleton width="35%" height={12} />
        <Skeleton width="90%" height={18} />
        <Skeleton width="60%" height={14} />
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--space-3)" }}>
          <Skeleton width="35%" height={22} />
          <Skeleton width="25%" height={18} />
        </div>
      </div>
      <div style={{ padding: "0 var(--space-4) var(--space-4)" }}>
        <Skeleton height={38} borderRadius="var(--radius-md, 8px)" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

// ─── Product Detail Page Skeleton ─────────────────────────────────────────────

export function ProductDetailSkeleton() {
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingTop: "var(--space-4)", paddingBottom: "var(--space-16)" }} aria-busy="true">
      <div className="container">
        {/* Breadcrumb skeleton */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "var(--space-4)" }}>
          <Skeleton width={50} height={14} />
          <Skeleton width={10} height={14} />
          <Skeleton width={70} height={14} />
          <Skeleton width={10} height={14} />
          <Skeleton width={120} height={14} />
        </div>

        {/* 3-Column Product Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 0.8fr", gap: "var(--space-6)", alignItems: "start" }} className="amazon-product-grid">
          {/* Col 1: Images */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Skeleton width={56} height={56} borderRadius="var(--radius-md)" />
              <Skeleton width={56} height={56} borderRadius="var(--radius-md)" />
              <Skeleton width={56} height={56} borderRadius="var(--radius-md)" />
            </div>
            <div style={{ flex: 1, aspectRatio: "1/1" }}>
              <Skeleton height="100%" borderRadius="var(--radius-xl)" />
            </div>
          </div>

          {/* Col 2: Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Skeleton width="25%" height={14} />
            <Skeleton width="85%" height={28} />
            <Skeleton width="40%" height={18} />
            <Skeleton width="30%" height={32} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "var(--space-2)" }}>
              <Skeleton width="100%" height={14} />
              <Skeleton width="95%" height={14} />
              <Skeleton width="90%" height={14} />
              <Skeleton width="70%" height={14} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "var(--space-4)" }}>
              <Skeleton height={60} borderRadius="var(--radius-md)" />
              <Skeleton height={60} borderRadius="var(--radius-md)" />
              <Skeleton height={60} borderRadius="var(--radius-md)" />
            </div>
          </div>

          {/* Col 3: Buy Box */}
          <div style={{ padding: "var(--space-6)", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
            <Skeleton width="40%" height={28} style={{ marginBottom: "var(--space-4)" }} />
            <Skeleton width="60%" height={16} style={{ marginBottom: "var(--space-3)" }} />
            <Skeleton width="100%" height={40} borderRadius="var(--radius-md)" style={{ marginBottom: "var(--space-3)" }} />
            <Skeleton width="100%" height={44} borderRadius="var(--radius-md)" style={{ marginBottom: "var(--space-2)" }} />
            <Skeleton width="100%" height={44} borderRadius="var(--radius-md)" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page Skeletons ──────────────────────────────────────────────────────

export function HomeHeroSkeleton() {
  return (
    <div style={{ width: "100%", height: "420px", position: "relative", marginBottom: "var(--space-8)" }} aria-busy="true">
      <Skeleton height="100%" borderRadius={0} />
    </div>
  );
}

export function HomeQuadSkeleton() {
  return (
    <div className="container" style={{ marginBottom: "var(--space-8)" }} aria-busy="true">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} style={{ padding: "var(--space-4)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
            <Skeleton width="60%" height={20} style={{ marginBottom: "var(--space-4)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <Skeleton height={110} borderRadius="var(--radius-md)" />
              <Skeleton height={110} borderRadius="var(--radius-md)" />
              <Skeleton height={110} borderRadius="var(--radius-md)" />
              <Skeleton height={110} borderRadius="var(--radius-md)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeRailSkeleton() {
  return (
    <div className="container" style={{ marginBottom: "var(--space-8)" }} aria-busy="true">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <Skeleton width={180} height={24} />
        <Skeleton width={80} height={16} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} style={{ padding: "var(--space-3)", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <Skeleton height={140} borderRadius="var(--radius-sm)" style={{ marginBottom: "var(--space-2)" }} />
            <Skeleton width="80%" height={14} style={{ marginBottom: "var(--space-1)" }} />
            <Skeleton width="40%" height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cart Page Skeleton ───────────────────────────────────────────────────────

export function CartPageSkeleton() {
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingTop: "var(--space-6)", paddingBottom: "var(--space-16)" }} aria-busy="true">
      <div className="container">
        <Skeleton width={200} height={32} style={{ marginBottom: "var(--space-6)" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--space-6)", alignItems: "start" }} className="cart-grid">
          {/* Cart Items list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} style={{ padding: "var(--space-4)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", display: "flex", gap: "var(--space-4)" }}>
                <Skeleton width={100} height={100} borderRadius="var(--radius-md)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Skeleton width="70%" height={18} />
                  <Skeleton width="30%" height={14} />
                  <Skeleton width="20%" height={20} />
                  <div style={{ marginTop: "auto", display: "flex", gap: "12px", alignItems: "center" }}>
                    <Skeleton width={90} height={32} borderRadius="var(--radius-sm)" />
                    <Skeleton width={60} height={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div style={{ padding: "var(--space-6)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Skeleton width="60%" height={22} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={24} />
            <Skeleton width="100%" height={46} borderRadius="var(--radius-md)" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders List & Detail Skeletons ───────────────────────────────────────────

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }} aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} style={{ padding: "var(--space-6)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <Skeleton width={120} height={16} />
              <Skeleton width={90} height={16} />
            </div>
            <Skeleton width={80} height={24} borderRadius="var(--radius-full, 999px)" />
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Skeleton width={64} height={64} borderRadius="var(--radius-md)" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              <Skeleton width="50%" height={16} />
              <Skeleton width="30%" height={14} />
            </div>
            <Skeleton width={70} height={20} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--color-border-subtle)", paddingTop: "var(--space-3)" }}>
            <Skeleton width={110} height={36} borderRadius="var(--radius-md)" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }} aria-busy="true">
      <div style={{ padding: "var(--space-6)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <Skeleton width={180} height={24} />
          <Skeleton width={90} height={24} borderRadius="var(--radius-full)" />
        </div>
        <Skeleton height={60} borderRadius="var(--radius-md)" style={{ marginBottom: "var(--space-4)" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Skeleton height={80} borderRadius="var(--radius-md)" />
          <Skeleton height={80} borderRadius="var(--radius-md)" />
        </div>
      </div>
    </div>
  );
}

// ─── Addresses & Dashboard Skeletons ──────────────────────────────────────────

export function AddressListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }} aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} style={{ padding: "var(--space-6)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Skeleton width="40%" height={18} />
          <Skeleton width="90%" height={14} />
          <Skeleton width="75%" height={14} />
          <Skeleton width="50%" height={14} />
          <div style={{ marginTop: "auto", display: "flex", gap: "8px", paddingTop: "var(--space-3)" }}>
            <Skeleton width={60} height={28} borderRadius="var(--radius-sm)" />
            <Skeleton width={60} height={28} borderRadius="var(--radius-sm)" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }} aria-busy="true">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} style={{ padding: "var(--space-6)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
          <Skeleton width="40%" height={14} style={{ marginBottom: "var(--space-2)" }} />
          <Skeleton width="60%" height={28} />
        </div>
      ))}
    </div>
  );
}

export function DashboardTableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "var(--space-4)" }} aria-busy="true">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
        <Skeleton width={160} height={20} />
        <Skeleton width={100} height={32} borderRadius="var(--radius-md)" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
          {Array.from({ length: cols }).map((_, idx) => (
            <Skeleton key={idx} width="70%" height={14} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "12px", alignItems: "center" }}>
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton key={cIdx} width={cIdx === 0 ? "85%" : "60%"} height={16} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

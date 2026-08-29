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
      }}
      aria-hidden="true"
    >
      <Skeleton height={240} borderRadius={0} />
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="85%" height={18} />
        <Skeleton width="60%" height={14} />
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--space-3)" }}>
          <Skeleton width="30%" height={22} />
          <Skeleton width="25%" height={18} />
        </div>
      </div>
      <div style={{ padding: "0 var(--space-4) var(--space-4)" }}>
        <Skeleton height={38} borderRadius="var(--radius-sm, 6px)" />
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

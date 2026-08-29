"use client";

import React, { Suspense } from "react";
import { Skeleton } from "./Skeleton";

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Reusable Suspense wrapper with customizable fallback.
 */
export function SuspenseBoundary({
  children,
  fallback,
}: SuspenseBoundaryProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div style={{ padding: "var(--space-8)", display: "flex", justifyContent: "center" }}>
            <Skeleton width="100%" height={200} borderRadius="var(--radius-lg)" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

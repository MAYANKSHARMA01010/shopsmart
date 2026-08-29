"use client";

import React, { lazy, Suspense } from "react";
import { useUI } from "@/context/UIContext";

// Lazy load the QuickViewModal from features/products to reduce initial bundle execution
const QuickViewModal = lazy(() => import("@/features/products/components/QuickViewModal"));

/**
 * Lazy Modal Controller that renders modals on demand inside a Suspense boundary.
 */
export function LazyModalContainer() {
  const { quickViewProduct } = useUI();

  if (!quickViewProduct) return null;

  return (
    <Suspense fallback={null}>
      <QuickViewModal />
    </Suspense>
  );
}

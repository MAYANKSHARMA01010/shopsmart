"use client";

import { useState, lazy, Suspense } from "react";
import { useWishlistStore } from "../store/wishlistStore";
import type { Product } from "../../products/types/productSchema";

const LazyWishlistFolderModal = lazy(() =>
  import("./WishlistFolderModal").then((m) => ({ default: m.WishlistFolderModal }))
);


interface WishlistButtonProps {
  product: Product;
  variant?: "icon" | "full";
  className?: string;
}

export function WishlistButton({
  product,
  variant = "icon",
  className = "",
}: WishlistButtonProps) {
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
      {variant === "full" ? (
        <button
          type="button"
          className={`btn btn-secondary ${className}`}
          onClick={handleClick}
          aria-label={isInWishlist ? "Manage Wishlist Folders" : "Save to Wishlist Folder"}
          title={isInWishlist ? "Saved in Wishlist Folder (Click to manage)" : "Save to Wishlist Folder"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            height: "44px",
            padding: "0 20px",
            borderRadius: "var(--radius-md)",
            color: isInWishlist ? "var(--color-primary)" : "var(--color-text-primary)",
            borderColor: isInWishlist ? "var(--color-primary)" : "var(--color-border)",
            background: isInWishlist ? "var(--color-primary-surface)" : "var(--color-surface)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isInWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span>{isInWishlist ? "In Wishlist Folder ✓" : "Save to Folder"}</span>
        </button>
      ) : (
        <button
          type="button"
          className={`wishlist-btn ${className}`}
          onClick={handleClick}
          aria-label={isInWishlist ? "Manage Wishlist Folder" : "Save to Wishlist Folder"}
          title={isInWishlist ? "Saved in Wishlist Folder (Click to manage)" : "Save to Wishlist Folder"}
          style={{
            background: isInWishlist ? "var(--color-primary-surface)" : "var(--color-surface)",
            border: isInWishlist ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            width: "38px",
            height: "38px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            color: isInWishlist ? "var(--color-primary)" : "var(--color-text-secondary)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isInWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "all 0.2s ease" }}
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Folder Selection Modal */}
      {modalOpen && (
        <Suspense fallback={null}>
          <LazyWishlistFolderModal
            product={product}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}


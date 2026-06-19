"use client";

import { useState } from "react";
import { useWishlistStore } from "../store/wishlistStore";
import type { Product } from "../../products/types/productSchema";

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export function WishlistButton({ product, className = "" }: WishlistButtonProps) {
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation if wrapped in a link
    e.stopPropagation();

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Remove animation class after 300ms

    try {
      await toggleItem(product);
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      // Optional: Add toast notification here
    }
  };

  return (
    <button
      type="button"
      className={`wishlist-btn ${className} ${isAnimating ? "pulse" : ""}`}
      onClick={handleToggle}
      aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      style={{
        background: "white",
        border: "none",
        borderRadius: "50%",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease, color 0.2s ease",
        color: isInWishlist ? "#e63946" : "#6c757d",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isInWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "all 0.2s ease" }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <style jsx>{`
        .wishlist-btn:hover {
          transform: scale(1.1);
          color: #e63946 !important;
        }
        .wishlist-btn.pulse svg {
          animation: pulseHeart 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pulseHeart {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  );
}

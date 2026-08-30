"use client";

import { useState } from "react";
import { useFavoritesStore } from "../store/favoritesStore";
import type { Product } from "../../products/types/productSchema";

interface FavoriteButtonProps {
  product: Product;
  className?: string;
}

export function FavoriteButton({ product, className = "" }: FavoriteButtonProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFav = useFavoritesStore((state) => state.isFavorite(product.id));
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    toggleFavorite(product);
  };

  return (
    <button
      type="button"
      className={`favorite-btn ${className} ${isAnimating ? "pulse" : ""}`}
      onClick={handleToggle}
      aria-label={isFav ? "Remove from Favorites" : "Add to Favorites"}
      title={isFav ? "Favorited (Click to remove)" : "Add to Favorites"}
      style={{
        background: "rgba(253, 252, 250, 0.9)",
        backdropFilter: "blur(6px)",
        border: isFav ? "1px solid rgba(230, 57, 70, 0.4)" : "1px solid var(--color-border)",
        borderRadius: "50%",
        width: "34px",
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(28, 25, 22, 0.08)",
        transition: "transform 0.2s ease, color 0.2s ease, background-color 0.2s ease",
        color: isFav ? "#e63946" : "var(--color-text-muted)",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "all 0.2s ease" }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

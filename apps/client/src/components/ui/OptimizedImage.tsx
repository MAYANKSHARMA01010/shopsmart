"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useImage } from "@/hooks/useImage";

export interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
}

const DEFAULT_PLACEHOLDER = "/images/product-placeholder.png";

/**
 * High-performance, accessible image component with progressive loading,
 * error recovery, lazy loading, and priority LCP support.
 */
export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className = "",
  style,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  objectFit = "cover",
  onLoad,
}: OptimizedImageProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { currentSrc, isError } = useImage({
    src,
    fallbackSrc,
    priority,
  });

  const computedSizes = sizes ?? (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined);

  return (
    <div
      className={`optimized-image-wrapper ${className}`}
      style={{
        position: fill ? "absolute" : "relative",
        top: fill ? 0 : undefined,
        left: fill ? 0 : undefined,
        width: fill ? "100%" : width ? `${width}px` : "auto",
        height: fill ? "100%" : height ? `${height}px` : "auto",
        overflow: "hidden",
        backgroundColor: "var(--color-surface-subtle, #f1f5f9)",
        ...style,
      }}
    >
      {/* Skeleton shimmer before image loads */}
      {!imgLoaded && !isError && (
        <div
          className="skeleton-shimmer"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "linear-gradient(90deg, var(--color-surface-subtle, #f1f5f9) 0%, var(--color-border, #e2e8f0) 50%, var(--color-surface-subtle, #f1f5f9) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
          aria-hidden="true"
        />
      )}

      <Image
        src={currentSrc}
        alt={alt || "Product image"}
        fill={fill}
        width={fill ? undefined : (width ?? 300)}
        height={fill ? undefined : (height ?? 300)}
        sizes={computedSizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        unoptimized
        onLoad={() => {
          setImgLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          setImgLoaded(true);
        }}
        style={{
          objectFit,
          transition: "opacity 0.25s ease-in-out, transform 0.3s ease",
          opacity: imgLoaded ? 1 : 0,
          ...style,
        }}
      />
    </div>
  );
}

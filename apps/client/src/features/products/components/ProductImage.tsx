"use client";

import { useState } from "react";
import Image from "next/image";

const PLACEHOLDER = "/images/product-placeholder.png";

interface ProductImageProps {
  /** The image URL from product.images[0] — do NOT pass constructed URLs, just pass the DB value */
  src: string | null | undefined;
  alt: string;
  /** Pass "fill" for containers with explicit height, or width/height for fixed-size */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Single canonical image component for all product images across the app.
 *
 * Rules enforced here:
 *  - Always uses product.images[0] (passed as `src`) — never constructs URLs
 *  - Falls back to /images/product-placeholder.png on error or missing src
 *  - Uses unoptimized=true to avoid Next.js optimiser timing out on slow external hosts (picsum)
 *  - Consistent rendering: Products page, Cart, Wishlist, Checkout all use this
 */
export function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority = false,
  style,
  className,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || PLACEHOLDER);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={fill ? undefined : (width ?? 280)}
      height={fill ? undefined : (height ?? 280)}
      sizes={sizes ?? "(max-width: 768px) 100vw, 280px"}
      style={style ?? { objectFit: "cover" }}
      className={className}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      unoptimized
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}


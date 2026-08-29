"use client";

import { useState, useEffect, useCallback } from "react";

export interface UseImageOptions {
  src?: string | null;
  fallbackSrc?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  priority?: boolean;
}

export interface UseImageReturn {
  currentSrc: string;
  isLoading: boolean;
  isError: boolean;
  isLoaded: boolean;
  reload: () => void;
}

const DEFAULT_FALLBACK = "/images/product-placeholder.png";

/**
 * Custom hook to manage responsive image loading, fallback substitution, and blur transitions.
 */
export function useImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  crossOrigin,
  priority = false,
}: UseImageOptions): UseImageReturn {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);
  const [isLoading, setIsLoading] = useState<boolean>(!priority);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!src) return;

    let active = true;
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.src = src;

    img.onload = () => {
      if (!active) return;
      setCurrentSrc(src);
      setIsLoading(false);
      setIsLoaded(true);
      setIsError(false);
    };

    img.onerror = () => {
      if (!active) return;
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
      setIsLoaded(true);
      setIsError(true);
    };

    return () => {
      active = false;
    };
  }, [src, fallbackSrc, crossOrigin]);



  const reload = useCallback(() => {
    if (!src) return;
    setIsLoading(true);
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      setIsLoaded(true);
      setIsError(false);
    };
    img.onerror = () => {
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
      setIsLoaded(true);
      setIsError(true);
    };
  }, [src, fallbackSrc, crossOrigin]);

  return {
    currentSrc,
    isLoading,
    isError,
    isLoaded,
    reload,
  };
}


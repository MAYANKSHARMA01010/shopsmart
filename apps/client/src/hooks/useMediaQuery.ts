"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Responsive breakpoint map matching CSS tokens
 */
export const BREAKPOINTS = {
  mobile: "(max-width: 640px)",
  tablet: "(min-width: 641px) and (max-width: 1024px)",
  desktop: "(min-width: 1025px)",
  darkMode: "(prefers-color-scheme: dark)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

/**
 * SSR-safe media query match hook using useSyncExternalStore.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}


/**
 * High-level helper hook for common responsive states
 */
export function useResponsive() {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  const isTablet = useMediaQuery(BREAKPOINTS.tablet);
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const prefersDark = useMediaQuery(BREAKPOINTS.darkMode);
  const prefersReducedMotion = useMediaQuery(BREAKPOINTS.reducedMotion);

  return {
    isMobile,
    isTablet,
    isDesktop,
    prefersDark,
    prefersReducedMotion,
  };
}

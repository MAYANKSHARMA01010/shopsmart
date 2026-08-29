"use client";

import { useState, useEffect, useRef } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Viewport intersection observer hook.
 * Ideal for lazy-rendering heavy sections, deferred animations, and infinite scroll triggers.
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = true,
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const elementRef = useRef<T | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(([entryUpdate]) => {
      setEntry(entryUpdate);
      setIsIntersecting(entryUpdate.isIntersecting);
    }, observerParams);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return { ref: elementRef, isIntersecting, entry };
}

"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to detect clicks outside of an element or pressing the Escape key.
 *
 * @param handler Callback invoked when a click occurs outside or Escape is pressed
 * @param active Whether the listener is currently active (defaults to true)
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  handler: () => void,
  active: boolean = true
) {
  const ref = useRef<T | null>(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!active) return;


    const handleClick = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains((event.target as Node) || null)) {
        return;
      }
      handlerRef.current();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handlerRef.current();
      }
    };

    document.addEventListener("mousedown", handleClick, true);
    document.addEventListener("touchstart", handleClick, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick, true);
      document.removeEventListener("touchstart", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return ref;
}

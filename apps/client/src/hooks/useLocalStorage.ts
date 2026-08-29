"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Type-safe persistent LocalStorage hook with cross-tab event synchronization.
 *
 * @param key LocalStorage key
 * @param initialValue Default value if key is not found
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Lazy state initialization
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Setter function
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((current) => {
          const valueToStore = value instanceof Function ? value(current) : value;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Dispatch a custom event so same-tab listeners also update
            window.dispatchEvent(
              new CustomEvent("shopsmart:local-storage", {
                detail: { key, value: valueToStore },
              })
            );
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Remove function
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
        window.dispatchEvent(
          new CustomEvent("shopsmart:local-storage", {
            detail: { key, value: initialValue },
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sync state if another tab or window updates the same localStorage key
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // ignore parse error
        }
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; value: T }>;
      if (customEvent.detail?.key === key) {
        setStoredValue(customEvent.detail.value);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("shopsmart:local-storage" as any, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("shopsmart:local-storage" as any, handleCustomChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}

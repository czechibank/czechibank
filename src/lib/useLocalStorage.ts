"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * React hook that syncs a value to localStorage with cross-tab support via the `storage` event.
 * On the server, returns `initialValue` and a no-op setter.
 *
 * For high-frequency writes (e.g. tracking mouse/keyboard activity), prefer direct localStorage
 * calls to avoid React re-renders on every event.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const initialRef = useRef(initialValue);

  const getSnapshot = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initialRef.current;
    } catch {
      return initialRef.current;
    }
  }, [key]);

  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key || e.key === null) onChange();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [key],
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, () => initialRef.current);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      try {
        const current = getSnapshot();
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(current) : next;
        localStorage.setItem(key, JSON.stringify(resolved));
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {}
    },
    [key, getSnapshot],
  );

  return [value, setValue];
}

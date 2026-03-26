import { useState, useCallback } from 'react';

/**
 * A boolean toggle that persists to localStorage.
 */
export function usePersistedToggle(key: string, defaultValue = false): [boolean, () => void] {
  const storageKey = `verse-${key}`;

  const [value, setValue] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) return stored === 'true';
    } catch {
      // Ignore
    }
    return defaultValue;
  });

  const toggle = useCallback(() => {
    setValue((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, [storageKey]);

  return [value, toggle];
}

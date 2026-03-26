import { useState, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'verse-columns';

/**
 * Hook to manage column visibility with localStorage persistence.
 * @param scope Identifier (e.g., 'movies', 'tvshows')
 * @param columns Available columns with default visibility
 */
export function useColumnVisibility(
  scope: string,
  columns: { id: string; label: string; defaultVisible?: boolean }[]
) {
  const storageKey = `${STORAGE_KEY_PREFIX}-${scope}`;

  const defaults = Object.fromEntries(columns.map((c) => [c.id, c.defaultVisible !== false]));

  const [visibility, setVisibilityState] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return { ...defaults, ...(JSON.parse(stored) as Record<string, boolean>) };
      }
    } catch {
      // Ignore
    }
    return defaults;
  });

  const toggle = useCallback(
    (columnId: string) => {
      setVisibilityState((prev) => {
        const next = { ...prev, [columnId]: !prev[columnId] };
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
    },
    [storageKey]
  );

  const isVisible = useCallback((columnId: string) => visibility[columnId] !== false, [visibility]);

  return { visibility, toggle, isVisible, columns };
}

import { useState, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'verse-filters';

/**
 * Loads persisted filter state from localStorage, merging with defaults.
 * Search is never persisted.
 */
function loadFilters<T extends object>(scope: string, defaults: T): T {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${scope}`);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<T>;
      return { ...defaults, ...parsed, search: '' };
    }
  } catch {
    // Ignore parse errors
  }
  return defaults;
}

/**
 * Saves filter state to localStorage, excluding search.
 */
function saveFilters(scope: string, filters: object): void {
  try {
    const toSave = Object.fromEntries(Object.entries(filters).filter(([key]) => key !== 'search'));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}-${scope}`, JSON.stringify(toSave));
  } catch {
    // Ignore storage errors
  }
}

/**
 * useState wrapper that persists filter state to localStorage.
 * Search is excluded from persistence.
 */
export function usePersistedFilters<T extends object>(
  scope: string,
  defaults: T
): [T, (update: T | ((prev: T) => T)) => void] {
  const [filters, setFiltersState] = useState<T>(() => loadFilters(scope, defaults));

  const setFilters = useCallback(
    (update: T | ((prev: T) => T)) => {
      setFiltersState((prev) => {
        const next = typeof update === 'function' ? update(prev) : update;
        saveFilters(scope, next);
        return next;
      });
    },
    [scope]
  );

  return [filters, setFilters];
}

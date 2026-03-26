import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistedFilters } from './usePersistedFilters';

interface TestFilters {
  search: string;
  genre?: string;
  sortBy: string;
}

const DEFAULTS: TestFilters = {
  search: '',
  sortBy: 'title',
};

describe('usePersistedFilters', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('when no stored state exists', () => {
    it('returns the defaults', () => {
      const { result } = renderHook(() => usePersistedFilters<TestFilters>('test', DEFAULTS));
      const [filters] = result.current;

      expect(filters).toEqual(DEFAULTS);
    });
  });

  describe('when updating filters', () => {
    it('persists non-search fields to localStorage', () => {
      const { result } = renderHook(() => usePersistedFilters<TestFilters>('test', DEFAULTS));

      act(() => {
        const [, setFilters] = result.current;
        setFilters({ search: 'hello', genre: 'Action', sortBy: 'year' });
      });

      const stored = JSON.parse(localStorage.getItem('verse-filters-test') ?? '{}') as Record<
        string,
        unknown
      >;
      expect(stored.genre).toBe('Action');
      expect(stored.sortBy).toBe('year');
    });

    it('excludes search from localStorage', () => {
      const { result } = renderHook(() => usePersistedFilters<TestFilters>('test', DEFAULTS));

      act(() => {
        const [, setFilters] = result.current;
        setFilters({ search: 'hello', sortBy: 'year' });
      });

      const stored = JSON.parse(localStorage.getItem('verse-filters-test') ?? '{}') as Record<
        string,
        unknown
      >;
      expect(stored.search).toBeUndefined();
    });
  });

  describe('when stored state exists', () => {
    it('restores persisted fields from localStorage', () => {
      localStorage.setItem(
        'verse-filters-test',
        JSON.stringify({ genre: 'Drama', sortBy: 'rating' })
      );

      const { result } = renderHook(() => usePersistedFilters<TestFilters>('test', DEFAULTS));
      const [filters] = result.current;

      expect(filters.genre).toBe('Drama');
      expect(filters.sortBy).toBe('rating');
    });

    it('resets search to empty on restore', () => {
      localStorage.setItem(
        'verse-filters-test',
        JSON.stringify({ search: 'stale', sortBy: 'year' })
      );

      const { result } = renderHook(() => usePersistedFilters<TestFilters>('test', DEFAULTS));
      const [filters] = result.current;

      const EXPECTED_SEARCH = '';
      expect(filters.search).toBe(EXPECTED_SEARCH);
    });

    it('merges stored state with defaults for missing fields', () => {
      localStorage.setItem('verse-filters-test', JSON.stringify({ sortBy: 'year' }));

      const { result } = renderHook(() => usePersistedFilters<TestFilters>('test', DEFAULTS));
      const [filters] = result.current;

      expect(filters.sortBy).toBe('year');
      expect(filters.search).toBe('');
    });
  });

  describe('when localStorage contains invalid data', () => {
    it('falls back to defaults', () => {
      localStorage.setItem('verse-filters-test', 'not-json');

      const { result } = renderHook(() => usePersistedFilters<TestFilters>('test', DEFAULTS));
      const [filters] = result.current;

      expect(filters).toEqual(DEFAULTS);
    });
  });

  describe('when using different scopes', () => {
    it('stores filters independently per scope', () => {
      const { result: moviesResult } = renderHook(() =>
        usePersistedFilters<TestFilters>('movies', DEFAULTS)
      );
      const { result: tvResult } = renderHook(() =>
        usePersistedFilters<TestFilters>('tvshows', DEFAULTS)
      );

      act(() => {
        const [, setMovieFilters] = moviesResult.current;
        setMovieFilters({ search: '', genre: 'Action', sortBy: 'year' });
      });

      act(() => {
        const [, setTvFilters] = tvResult.current;
        setTvFilters({ search: '', genre: 'Drama', sortBy: 'title' });
      });

      const moviesStored = JSON.parse(
        localStorage.getItem('verse-filters-movies') ?? '{}'
      ) as Record<string, unknown>;
      const tvStored = JSON.parse(localStorage.getItem('verse-filters-tvshows') ?? '{}') as Record<
        string,
        unknown
      >;

      expect(moviesStored.genre).toBe('Action');
      expect(tvStored.genre).toBe('Drama');
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnVisibility } from './useColumnVisibility';

const COLUMNS = [
  { id: 'year', label: 'Year' },
  { id: 'genre', label: 'Genre' },
  { id: 'rating', label: 'Rating' },
  { id: 'hidden', label: 'Hidden', defaultVisible: false },
];

describe('useColumnVisibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('when no stored state exists', () => {
    it('returns all columns visible by default', () => {
      const { result } = renderHook(() => useColumnVisibility('test', COLUMNS));

      const EXPECTED_VISIBLE = true;
      expect(result.current.isVisible('year')).toBe(EXPECTED_VISIBLE);
      expect(result.current.isVisible('genre')).toBe(EXPECTED_VISIBLE);
      expect(result.current.isVisible('rating')).toBe(EXPECTED_VISIBLE);
    });

    it('respects defaultVisible: false', () => {
      const { result } = renderHook(() => useColumnVisibility('test', COLUMNS));

      const EXPECTED_HIDDEN = false;
      expect(result.current.isVisible('hidden')).toBe(EXPECTED_HIDDEN);
    });
  });

  describe('when toggling a column', () => {
    it('hides a visible column', () => {
      const { result } = renderHook(() => useColumnVisibility('test', COLUMNS));

      act(() => {
        result.current.toggle('year');
      });

      const EXPECTED_HIDDEN = false;
      expect(result.current.isVisible('year')).toBe(EXPECTED_HIDDEN);
    });

    it('shows a hidden column', () => {
      const { result } = renderHook(() => useColumnVisibility('test', COLUMNS));

      act(() => {
        result.current.toggle('hidden');
      });

      const EXPECTED_VISIBLE = true;
      expect(result.current.isVisible('hidden')).toBe(EXPECTED_VISIBLE);
    });

    it('persists toggle state to localStorage', () => {
      const { result } = renderHook(() => useColumnVisibility('test', COLUMNS));

      act(() => {
        result.current.toggle('genre');
      });

      const stored = JSON.parse(localStorage.getItem('verse-columns-test') ?? '{}') as Record<
        string,
        unknown
      >;
      const EXPECTED_HIDDEN = false;
      expect(stored.genre).toBe(EXPECTED_HIDDEN);
    });
  });

  describe('when stored state exists', () => {
    it('restores column visibility from localStorage', () => {
      localStorage.setItem(
        'verse-columns-test',
        JSON.stringify({ year: false, genre: true, rating: true, hidden: false })
      );

      const { result } = renderHook(() => useColumnVisibility('test', COLUMNS));

      const EXPECTED_HIDDEN = false;
      const EXPECTED_VISIBLE = true;
      expect(result.current.isVisible('year')).toBe(EXPECTED_HIDDEN);
      expect(result.current.isVisible('genre')).toBe(EXPECTED_VISIBLE);
    });
  });

  describe('when using different scopes', () => {
    it('stores state independently per scope', () => {
      const { result: moviesResult } = renderHook(() => useColumnVisibility('movies', COLUMNS));
      const { result: tvResult } = renderHook(() => useColumnVisibility('tvshows', COLUMNS));

      act(() => {
        moviesResult.current.toggle('year');
      });

      const EXPECTED_HIDDEN = false;
      const EXPECTED_VISIBLE = true;
      expect(moviesResult.current.isVisible('year')).toBe(EXPECTED_HIDDEN);
      expect(tvResult.current.isVisible('year')).toBe(EXPECTED_VISIBLE);
    });
  });

  describe('when returning column definitions', () => {
    it('returns the original column definitions', () => {
      const { result } = renderHook(() => useColumnVisibility('test', COLUMNS));

      expect(result.current.columns).toBe(COLUMNS);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistedToggle } from './usePersistedToggle';

describe('usePersistedToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('when no stored state exists', () => {
    it('returns the default value', () => {
      const { result } = renderHook(() => usePersistedToggle('test-toggle', false));
      const [value] = result.current;

      const EXPECTED_DEFAULT = false;
      expect(value).toBe(EXPECTED_DEFAULT);
    });

    it('supports a true default', () => {
      const { result } = renderHook(() => usePersistedToggle('test-toggle', true));
      const [value] = result.current;

      const EXPECTED_DEFAULT = true;
      expect(value).toBe(EXPECTED_DEFAULT);
    });
  });

  describe('when toggling', () => {
    it('flips false to true', () => {
      const { result } = renderHook(() => usePersistedToggle('test-toggle', false));

      act(() => {
        const [, toggle] = result.current;
        toggle();
      });

      const [value] = result.current;
      const EXPECTED_TOGGLED = true;
      expect(value).toBe(EXPECTED_TOGGLED);
    });

    it('flips true to false', () => {
      const { result } = renderHook(() => usePersistedToggle('test-toggle', true));

      act(() => {
        const [, toggle] = result.current;
        toggle();
      });

      const [value] = result.current;
      const EXPECTED_TOGGLED = false;
      expect(value).toBe(EXPECTED_TOGGLED);
    });

    it('persists state to localStorage', () => {
      const { result } = renderHook(() => usePersistedToggle('test-toggle', false));

      act(() => {
        const [, toggle] = result.current;
        toggle();
      });

      const stored = localStorage.getItem('verse-test-toggle');
      expect(stored).toBe('true');
    });
  });

  describe('when stored state exists', () => {
    it('restores true from localStorage', () => {
      localStorage.setItem('verse-test-toggle', 'true');

      const { result } = renderHook(() => usePersistedToggle('test-toggle', false));
      const [value] = result.current;

      const EXPECTED_RESTORED = true;
      expect(value).toBe(EXPECTED_RESTORED);
    });

    it('restores false from localStorage', () => {
      localStorage.setItem('verse-test-toggle', 'false');

      const { result } = renderHook(() => usePersistedToggle('test-toggle', true));
      const [value] = result.current;

      const EXPECTED_RESTORED = false;
      expect(value).toBe(EXPECTED_RESTORED);
    });
  });
});

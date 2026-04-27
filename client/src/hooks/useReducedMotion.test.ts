import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion, getAnimationClass, getAnimationDuration, getAnimationStyle } from './useReducedMotion';

describe('useReducedMotion Hook', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.matchMedia
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useReducedMotion', () => {
    it('should return false when prefers-reduced-motion is not set', () => {
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
    });

    it('should return true when prefers-reduced-motion is set to reduce', () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(true);
    });

    it('should add event listener on mount', () => {
      const addEventListenerMock = vi.fn();
      matchMediaMock.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderHook(() => useReducedMotion());
      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should remove event listener on unmount', () => {
      const removeEventListenerMock = vi.fn();
      matchMediaMock.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      }));

      const { unmount } = renderHook(() => useReducedMotion());
      unmount();
      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update state when media query changes', () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;
      matchMediaMock.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result, rerender } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);

      // Simulate media query change
      if (changeHandler) {
        act(() => {
          changeHandler!({
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent);
        });
      }

      rerender();
      expect(result.current).toBe(true);
    });

    it('should handle missing window.matchMedia gracefully', () => {
      const originalMatchMedia = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined,
      });

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
    });
  });

  describe('getAnimationClass', () => {
    it('should return animation class when prefersReducedMotion is false', () => {
      const result = getAnimationClass(false, 'animate-slide-up');
      expect(result).toBe('animate-slide-up');
    });

    it('should return empty string when prefersReducedMotion is true', () => {
      const result = getAnimationClass(true, 'animate-slide-up');
      expect(result).toBe('');
    });

    it('should work with different animation class names', () => {
      expect(getAnimationClass(false, 'animate-fade-in')).toBe('animate-fade-in');
      expect(getAnimationClass(false, 'animate-scale-in')).toBe('animate-scale-in');
      expect(getAnimationClass(true, 'animate-fade-in')).toBe('');
      expect(getAnimationClass(true, 'animate-scale-in')).toBe('');
    });
  });

  describe('getAnimationDuration', () => {
    it('should return normal duration when prefersReducedMotion is false', () => {
      const result = getAnimationDuration(false, 300);
      expect(result).toBe(300);
    });

    it('should return 100ms when prefersReducedMotion is true', () => {
      const result = getAnimationDuration(true, 300);
      expect(result).toBe(100);
    });

    it('should work with different durations', () => {
      expect(getAnimationDuration(false, 200)).toBe(200);
      expect(getAnimationDuration(false, 500)).toBe(500);
      expect(getAnimationDuration(true, 200)).toBe(100);
      expect(getAnimationDuration(true, 500)).toBe(100);
    });
  });

  describe('getAnimationStyle', () => {
    it('should return animation style when prefersReducedMotion is false', () => {
      const style = { animation: 'slide-up 0.3s ease-out' };
      const result = getAnimationStyle(false, style);
      expect(result).toEqual(style);
    });

    it('should return empty object when prefersReducedMotion is true', () => {
      const style = { animation: 'slide-up 0.3s ease-out' };
      const result = getAnimationStyle(true, style);
      expect(result).toEqual({});
    });

    it('should work with complex style objects', () => {
      const complexStyle = {
        animation: 'slide-up 0.3s ease-out',
        transform: 'translateY(20px)',
        opacity: '0',
      };
      expect(getAnimationStyle(false, complexStyle)).toEqual(complexStyle);
      expect(getAnimationStyle(true, complexStyle)).toEqual({});
    });

    it('should not modify the original style object', () => {
      const style = { animation: 'slide-up 0.3s ease-out' };
      const originalStyle = { ...style };
      getAnimationStyle(false, style);
      expect(style).toEqual(originalStyle);
    });
  });
});

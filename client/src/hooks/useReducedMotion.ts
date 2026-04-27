import { useState, useEffect } from 'react';

/**
 * Hook to detect and respect user's prefers-reduced-motion setting
 * Returns a boolean indicating if the user prefers reduced motion
 * 
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * const animationClass = prefersReducedMotion ? '' : 'animate-slide-up';
 */
export function useReducedMotion(): boolean {
  // Initialize state with lazy initializer to get initial value from media query
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (!window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    // Check if the media query is supported
    if (!window.matchMedia) {
      return;
    }

    // Create media query for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Create event handler for media query changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Add event listener for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup event listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Utility function to conditionally apply animation classes based on motion preference
 * 
 * Usage:
 * const animationClass = getAnimationClass(prefersReducedMotion, 'animate-slide-up');
 * 
 * @param prefersReducedMotion - Boolean indicating if user prefers reduced motion
 * @param animationClass - CSS class name for the animation
 * @returns The animation class if motion is allowed, empty string otherwise
 */
export function getAnimationClass(
  prefersReducedMotion: boolean,
  animationClass: string
): string {
  return prefersReducedMotion ? '' : animationClass;
}

/**
 * Utility function to get animation duration based on motion preference
 * 
 * Usage:
 * const duration = getAnimationDuration(prefersReducedMotion, 300);
 * 
 * @param prefersReducedMotion - Boolean indicating if user prefers reduced motion
 * @param normalDuration - Normal animation duration in milliseconds
 * @returns Very fast duration (100ms) if motion is reduced, normal duration otherwise
 */
export function getAnimationDuration(
  prefersReducedMotion: boolean,
  normalDuration: number
): number {
  return prefersReducedMotion ? 100 : normalDuration;
}

/**
 * Utility function to conditionally apply animation styles based on motion preference
 * 
 * Usage:
 * const style = getAnimationStyle(prefersReducedMotion, { animation: 'slide-up 0.3s ease-out' });
 * 
 * @param prefersReducedMotion - Boolean indicating if user prefers reduced motion
 * @param animationStyle - CSS style object with animation properties
 * @returns Animation style if motion is allowed, empty object otherwise
 */
export function getAnimationStyle(
  prefersReducedMotion: boolean,
  animationStyle: Record<string, string>
): Record<string, string> {
  return prefersReducedMotion ? {} : animationStyle;
}

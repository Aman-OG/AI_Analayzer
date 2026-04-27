/**
 * Animation Utility Functions
 * Provides helper functions for generating animation classes and managing animations
 */

/**
 * Animation timing options
 */
export type AnimationTiming = 'fast' | 'normal' | 'slow';

/**
 * Animation easing options
 */
export type AnimationEasing = 'ease-out' | 'ease-in-out' | 'ease-in';

/**
 * Animation type options
 */
export type AnimationType = 'entrance' | 'exit' | 'loading' | 'micro';

/**
 * Entrance animation options
 */
export type EntranceAnimation = 'slide-up' | 'fade-in' | 'scale-in';

/**
 * Exit animation options
 */
export type ExitAnimation = 'slide-out' | 'fade-out';

/**
 * Loading animation options
 */
export type LoadingAnimation = 'shimmer' | 'pulse-glow' | 'pulse-opacity';

/**
 * Micro-interaction animation options
 */
export type MicroAnimation = 'rotate' | 'rotate-180' | 'scale' | 'color-change';

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  animation: EntranceAnimation | ExitAnimation | LoadingAnimation | MicroAnimation;
  timing?: AnimationTiming;
  easing?: AnimationEasing;
  delay?: number;
  stagger?: number;
  staggerIndex?: number;
  infinite?: boolean;
  prefers?: boolean;
}

/**
 * Animation timing constants (in milliseconds)
 */
export const ANIMATION_TIMINGS = {
  fast: 150,
  normal: 350,
  slow: 600,
} as const;

/**
 * Animation easing functions
 */
export const ANIMATION_EASINGS = {
  'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

/**
 * Entrance animation durations (in milliseconds)
 */
export const ENTRANCE_ANIMATION_DURATIONS = {
  'slide-up': { fast: 400, normal: 500, slow: 600 },
  'fade-in': { fast: 400, normal: 500, slow: 600 },
  'scale-in': { fast: 200, normal: 300, slow: 400 },
} as const;

/**
 * Exit animation durations (in milliseconds)
 */
export const EXIT_ANIMATION_DURATIONS = {
  'slide-out': { fast: 200, normal: 300, slow: 400 },
  'fade-out': { fast: 200, normal: 300, slow: 400 },
} as const;

/**
 * Loading animation durations (in milliseconds)
 */
export const LOADING_ANIMATION_DURATIONS = {
  shimmer: 2000,
  'pulse-glow': 2000,
  'pulse-opacity': 2000,
} as const;

/**
 * Micro-interaction animation durations (in milliseconds)
 */
export const MICRO_ANIMATION_DURATIONS = {
  rotate: 1000,
  'rotate-180': 300,
  scale: 300,
  'color-change': 300,
} as const;

/**
 * Stagger delay increment (in milliseconds)
 */
export const STAGGER_DELAY_INCREMENT = 100;

/**
 * Generate animation class name based on configuration
 * @param config - Animation configuration
 * @returns CSS class name string
 */
export function generateAnimationClass(config: AnimationConfig): string {
  const classes: string[] = [];

  // Add base animation class
  classes.push(`animate-${config.animation}`);

  // Add timing class if specified
  if (config.timing && config.timing !== 'normal') {
    classes.push(`animate-${config.animation}-${config.timing}`);
  }

  // Add easing class if specified
  if (config.easing) {
    classes.push(`animate-ease-${config.easing}`);
  }

  // Add infinite class if specified
  if (config.infinite) {
    classes.push('animate-iteration-infinite');
  }

  // Add GPU acceleration
  classes.push('gpu-accelerate');

  return classes.join(' ');
}

/**
 * Generate staggered animation classes for multiple elements
 * @param animation - Animation type
 * @param count - Number of elements
 * @param timing - Animation timing
 * @param easing - Animation easing
 * @returns Array of CSS class strings
 */
export function generateStaggeredAnimationClasses(
  animation: EntranceAnimation | ExitAnimation | LoadingAnimation | MicroAnimation,
  count: number,
  timing: AnimationTiming = 'normal',
  easing: AnimationEasing = 'ease-out'
): string[] {
  const classes: string[] = [];

  for (let i = 0; i < count; i++) {
    const staggerClass = `animate-stagger-${i + 1}`;
    const animationClass = generateAnimationClass({
      animation,
      timing,
      easing,
      staggerIndex: i,
    });

    classes.push(`${animationClass} ${staggerClass}`);
  }

  return classes;
}

/**
 * Get animation duration in milliseconds
 * @param animation - Animation name
 * @param timing - Animation timing
 * @returns Duration in milliseconds
 */
export function getAnimationDuration(
  animation: EntranceAnimation | ExitAnimation | LoadingAnimation | MicroAnimation,
  timing: AnimationTiming = 'normal'
): number {
  // Check entrance animations
  if (animation in ENTRANCE_ANIMATION_DURATIONS) {
    return ENTRANCE_ANIMATION_DURATIONS[animation as EntranceAnimation][timing];
  }

  // Check exit animations
  if (animation in EXIT_ANIMATION_DURATIONS) {
    return EXIT_ANIMATION_DURATIONS[animation as ExitAnimation][timing];
  }

  // Check loading animations
  if (animation in LOADING_ANIMATION_DURATIONS) {
    return LOADING_ANIMATION_DURATIONS[animation as LoadingAnimation];
  }

  // Check micro animations
  if (animation in MICRO_ANIMATION_DURATIONS) {
    return MICRO_ANIMATION_DURATIONS[animation as MicroAnimation];
  }

  // Default to normal timing
  return ANIMATION_TIMINGS.normal;
}

/**
 * Calculate total animation duration with stagger
 * @param animation - Animation name
 * @param count - Number of elements
 * @param timing - Animation timing
 * @returns Total duration in milliseconds
 */
export function getTotalAnimationDuration(
  animation: EntranceAnimation | ExitAnimation | LoadingAnimation | MicroAnimation,
  count: number,
  timing: AnimationTiming = 'normal'
): number {
  const animationDuration = getAnimationDuration(animation, timing);
  const staggerDuration = (count - 1) * STAGGER_DELAY_INCREMENT;
  return animationDuration + staggerDuration;
}

/**
 * Check if user prefers reduced motion
 * @returns Boolean indicating if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Generate animation inline styles
 * @param config - Animation configuration
 * @returns Inline style object
 */
export function generateAnimationStyles(config: AnimationConfig): React.CSSProperties {
  const styles: React.CSSProperties = {};

  // Add animation delay if specified
  if (config.delay !== undefined) {
    styles.animationDelay = `${config.delay}ms`;
  }

  // Add stagger delay if specified
  if (config.staggerIndex !== undefined) {
    const staggerDelay = config.staggerIndex * STAGGER_DELAY_INCREMENT;
    styles.animationDelay = `${staggerDelay}ms`;
  }

  // Add animation duration
  const duration = getAnimationDuration(config.animation, config.timing);
  styles.animationDuration = `${duration}ms`;

  // Add animation easing
  if (config.easing) {
    styles.animationTimingFunction = ANIMATION_EASINGS[config.easing];
  }

  // Add animation fill mode
  styles.animationFillMode = 'forwards';

  // Add animation iteration count
  if (config.infinite) {
    styles.animationIterationCount = 'infinite';
  }

  return styles;
}

/**
 * Create animation keyframes CSS string
 * @param animation - Animation name
 * @returns CSS keyframes string
 */
export function createAnimationKeyframes(
  animation: EntranceAnimation | ExitAnimation | LoadingAnimation | MicroAnimation
): string {
  const keyframes: Record<string, string> = {
    'slide-up': `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    'fade-in': `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
    'scale-in': `
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
    'slide-out': `
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }
    `,
    'fade-out': `
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `,
    shimmer: `
      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }
    `,
    'pulse-glow': `
      @keyframes pulseGlow {
        0%, 100% {
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.2);
        }
        50% {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }
      }
    `,
    rotate: `
      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
    'rotate-180': `
      @keyframes rotate180 {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(180deg);
        }
      }
    `,
    scale: `
      @keyframes scale {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
    `,
    'color-change': `
      @keyframes colorChange {
        0% {
          color: inherit;
        }
        50% {
          color: hsl(var(--primary));
        }
        100% {
          color: inherit;
        }
      }
    `,
  };

  return keyframes[animation] || '';
}

/**
 * Combine multiple animation classes
 * @param animations - Array of animation configurations
 * @returns Combined CSS class string
 */
export function combineAnimationClasses(animations: AnimationConfig[]): string {
  return animations.map((config) => generateAnimationClass(config)).join(' ');
}

/**
 * Create animation delay map for staggered animations
 * @param count - Number of elements
 * @param increment - Delay increment in milliseconds
 * @returns Map of index to delay
 */
export function createStaggerDelayMap(
  count: number,
  increment: number = STAGGER_DELAY_INCREMENT
): Map<number, number> {
  const delayMap = new Map<number, number>();

  for (let i = 0; i < count; i++) {
    delayMap.set(i, i * increment);
  }

  return delayMap;
}

/**
 * Get animation class for entrance animation
 * @param animation - Entrance animation type
 * @param timing - Animation timing
 * @returns CSS class string
 */
export function getEntranceAnimationClass(
  animation: EntranceAnimation,
  timing: AnimationTiming = 'normal'
): string {
  return generateAnimationClass({
    animation,
    timing,
    easing: 'ease-out',
  });
}

/**
 * Get animation class for exit animation
 * @param animation - Exit animation type
 * @param timing - Animation timing
 * @returns CSS class string
 */
export function getExitAnimationClass(
  animation: ExitAnimation,
  timing: AnimationTiming = 'normal'
): string {
  return generateAnimationClass({
    animation,
    timing,
    easing: 'ease-in',
  });
}

/**
 * Get animation class for loading animation
 * @param animation - Loading animation type
 * @returns CSS class string
 */
export function getLoadingAnimationClass(animation: LoadingAnimation): string {
  return generateAnimationClass({
    animation,
    infinite: true,
  });
}

/**
 * Get animation class for micro-interaction animation
 * @param animation - Micro animation type
 * @param timing - Animation timing
 * @returns CSS class string
 */
export function getMicroAnimationClass(
  animation: MicroAnimation,
  timing: AnimationTiming = 'normal'
): string {
  return generateAnimationClass({
    animation,
    timing,
    easing: 'ease-in-out',
  });
}

/**
 * Create animation observer for lazy-loading animations
 * @param callback - Callback function when element becomes visible
 * @param options - IntersectionObserver options
 * @returns IntersectionObserver instance
 */
export function createAnimationObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, options);
}

/**
 * Apply animation to element
 * @param element - DOM element
 * @param animation - Animation configuration
 */
export function applyAnimation(element: HTMLElement, config: AnimationConfig): void {
  const classes = generateAnimationClass(config);
  element.classList.add(...classes.split(' '));
}

/**
 * Remove animation from element
 * @param element - DOM element
 * @param animation - Animation configuration
 */
export function removeAnimation(element: HTMLElement, config: AnimationConfig): void {
  const classes = generateAnimationClass(config);
  element.classList.remove(...classes.split(' '));
}

/**
 * Wait for animation to complete
 * @param element - DOM element
 * @returns Promise that resolves when animation completes
 */
export function waitForAnimation(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const handleAnimationEnd = () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      resolve();
    };

    element.addEventListener('animationend', handleAnimationEnd);
  });
}

/**
 * Get animation delay for staggered element
 * @param index - Element index
 * @param increment - Delay increment in milliseconds
 * @returns Delay in milliseconds
 */
export function getStaggerDelay(
  index: number,
  increment: number = STAGGER_DELAY_INCREMENT
): number {
  return index * increment;
}

/**
 * Format animation delay for CSS
 * @param delay - Delay in milliseconds
 * @returns Formatted delay string
 */
export function formatAnimationDelay(delay: number): string {
  return `${delay}ms`;
}

/**
 * Format animation duration for CSS
 * @param duration - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatAnimationDuration(duration: number): string {
  return `${duration}ms`;
}

/**
 * Check if animation is supported
 * @returns Boolean indicating if animations are supported
 */
export function isAnimationSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const element = document.createElement('div');
  const animationSupport =
    element.style.animation !== undefined ||
    (element.style as any).WebkitAnimation !== undefined;

  return animationSupport;
}

/**
 * Get animation performance metrics
 * @returns Object with animation performance data
 */
export function getAnimationPerformanceMetrics(): {
  fps: number;
  isSmooth: boolean;
  supportsGPU: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      fps: 60,
      isSmooth: true,
      supportsGPU: true,
    };
  }

  // Check for GPU acceleration support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const supportsGPU = gl !== null;

  // Estimate FPS based on device capabilities
  const deviceMemory = (navigator as any).deviceMemory || 4;
  const fps = deviceMemory >= 4 ? 60 : 30;
  const isSmooth = fps >= 60;

  return {
    fps,
    isSmooth,
    supportsGPU,
  };
}

export default {
  generateAnimationClass,
  generateStaggeredAnimationClasses,
  getAnimationDuration,
  getTotalAnimationDuration,
  prefersReducedMotion,
  generateAnimationStyles,
  createAnimationKeyframes,
  combineAnimationClasses,
  createStaggerDelayMap,
  getEntranceAnimationClass,
  getExitAnimationClass,
  getLoadingAnimationClass,
  getMicroAnimationClass,
  createAnimationObserver,
  applyAnimation,
  removeAnimation,
  waitForAnimation,
  getStaggerDelay,
  formatAnimationDelay,
  formatAnimationDuration,
  isAnimationSupported,
  getAnimationPerformanceMetrics,
  ANIMATION_TIMINGS,
  ANIMATION_EASINGS,
  ENTRANCE_ANIMATION_DURATIONS,
  EXIT_ANIMATION_DURATIONS,
  LOADING_ANIMATION_DURATIONS,
  MICRO_ANIMATION_DURATIONS,
  STAGGER_DELAY_INCREMENT,
};

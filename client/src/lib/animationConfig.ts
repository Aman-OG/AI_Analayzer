/**
 * Animation Configuration Constants
 * Centralized configuration for animation timing, easing, and effects
 * Used throughout the application for consistent animation behavior
 */

/**
 * Animation timing values in milliseconds
 * Defines the speed categories for animations
 */
export const ANIMATION_TIMING = {
  // Fast animations: 100-200ms
  FAST_MIN: 100,
  FAST_MID: 150,
  FAST_MAX: 200,

  // Normal animations: 300-400ms
  NORMAL_MIN: 300,
  NORMAL_MID: 350,
  NORMAL_MAX: 400,

  // Slow animations: 500-800ms
  SLOW_MIN: 500,
  SLOW_MID: 600,
  SLOW_MAX: 800,
} as const;

/**
 * Predefined timing presets for common use cases
 */
export const TIMING_PRESETS = {
  fast: ANIMATION_TIMING.FAST_MID,
  normal: ANIMATION_TIMING.NORMAL_MID,
  slow: ANIMATION_TIMING.SLOW_MID,
} as const;

/**
 * Easing functions for different animation types
 * Uses cubic-bezier for smooth, natural motion
 */
export const EASING_FUNCTIONS = {
  // Entrance animations: ease-out for quick start, smooth deceleration
  'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Transitions: ease-in-out for smooth acceleration and deceleration
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Exit animations: ease-in for smooth acceleration
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',

  // Linear for consistent speed (used for loading animations)
  linear: 'linear',

  // Custom easing for specific effects
  'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
} as const;

/**
 * Stagger delay configuration
 * Defines delays between sequential animations
 */
export const STAGGER_DELAYS = {
  // Minimum stagger delay
  MIN: 50,

  // Standard stagger delay
  STANDARD: 75,

  // Maximum stagger delay
  MAX: 100,

  // Extra spacing for emphasis
  EXTRA: 150,
} as const;

/**
 * Animation duration configuration for specific effects
 */
export const ANIMATION_DURATIONS = {
  // Entrance animations
  entrance: {
    slideUp: ANIMATION_TIMING.NORMAL_MAX,
    fadeIn: ANIMATION_TIMING.NORMAL_MAX,
    scaleIn: ANIMATION_TIMING.FAST_MAX,
    slideDown: ANIMATION_TIMING.NORMAL_MAX,
    slideLeft: ANIMATION_TIMING.NORMAL_MAX,
    slideRight: ANIMATION_TIMING.NORMAL_MAX,
  },

  // Exit animations
  exit: {
    slideOut: ANIMATION_TIMING.FAST_MAX,
    fadeOut: ANIMATION_TIMING.FAST_MAX,
    scaleOut: ANIMATION_TIMING.FAST_MAX,
  },

  // Hover effects
  hover: {
    scale: ANIMATION_TIMING.FAST_MID,
    colorChange: ANIMATION_TIMING.FAST_MID,
    shadowElevation: ANIMATION_TIMING.FAST_MID,
    borderColorChange: ANIMATION_TIMING.FAST_MID,
    translateUp: ANIMATION_TIMING.FAST_MID,
  },

  // Click/Active effects
  click: {
    scaleDown: ANIMATION_TIMING.FAST_MID,
    scaleUp: ANIMATION_TIMING.FAST_MID,
  },

  // Focus effects
  focus: {
    ringAppear: ANIMATION_TIMING.FAST_MID,
    glowPulse: ANIMATION_TIMING.NORMAL_MID,
  },

  // Loading animations
  loading: {
    shimmer: 2000,
    pulseGlow: 2000,
    pulseOpacity: 2000,
    spinner: 1000,
  },

  // Page transitions
  pageTransition: {
    fadeIn: ANIMATION_TIMING.NORMAL_MAX,
    fadeOut: ANIMATION_TIMING.NORMAL_MAX,
  },

  // Theme transitions
  themeTransition: ANIMATION_TIMING.NORMAL_MAX,

  // Modal animations
  modal: {
    slideIn: ANIMATION_TIMING.NORMAL_MAX,
    slideOut: ANIMATION_TIMING.NORMAL_MAX,
    fadeIn: ANIMATION_TIMING.NORMAL_MAX,
    fadeOut: ANIMATION_TIMING.NORMAL_MAX,
  },

  // Toast animations
  toast: {
    slideIn: ANIMATION_TIMING.NORMAL_MID,
    slideOut: ANIMATION_TIMING.NORMAL_MID,
    fadeIn: ANIMATION_TIMING.NORMAL_MID,
    fadeOut: ANIMATION_TIMING.NORMAL_MID,
  },

  // Dropdown animations
  dropdown: {
    slideDown: ANIMATION_TIMING.FAST_MAX,
    slideUp: ANIMATION_TIMING.FAST_MAX,
  },

  // Icon animations
  icon: {
    rotate: ANIMATION_TIMING.FAST_MAX,
    rotate180: ANIMATION_TIMING.FAST_MAX,
    scale: ANIMATION_TIMING.FAST_MAX,
  },
} as const;

/**
 * Easing presets for different animation types
 */
export const EASING_PRESETS = {
  // Entrance animations use ease-out for quick start
  entrance: EASING_FUNCTIONS['ease-out'],

  // Transitions use ease-in-out for smooth motion
  transition: EASING_FUNCTIONS['ease-in-out'],

  // Exit animations use ease-in for smooth acceleration
  exit: EASING_FUNCTIONS['ease-in'],

  // Loading animations use linear for consistent speed
  loading: EASING_FUNCTIONS.linear,

  // Hover effects use ease-in-out for smooth motion
  hover: EASING_FUNCTIONS['ease-in-out'],

  // Click effects use ease-out for quick feedback
  click: EASING_FUNCTIONS['ease-out'],

  // Focus effects use ease-out for quick appearance
  focus: EASING_FUNCTIONS['ease-out'],
} as const;

/**
 * Animation configuration for specific components
 */
export const COMPONENT_ANIMATIONS = {
  // Button animations
  button: {
    hover: {
      duration: ANIMATION_DURATIONS.hover.scale,
      easing: EASING_PRESETS.hover,
      transform: 'translateY(-2px)',
    },
    click: {
      duration: ANIMATION_DURATIONS.click.scaleDown,
      easing: EASING_PRESETS.click,
      transform: 'scale(0.95)',
    },
    focus: {
      duration: ANIMATION_DURATIONS.focus.ringAppear,
      easing: EASING_PRESETS.focus,
    },
  },

  // Card animations
  card: {
    hover: {
      duration: ANIMATION_DURATIONS.hover.scale,
      easing: EASING_PRESETS.hover,
      transform: 'scale(1.02)',
    },
    entrance: {
      duration: ANIMATION_DURATIONS.entrance.slideUp,
      easing: EASING_PRESETS.entrance,
    },
  },

  // Input animations
  input: {
    focus: {
      duration: ANIMATION_DURATIONS.focus.ringAppear,
      easing: EASING_PRESETS.focus,
    },
    error: {
      duration: ANIMATION_DURATIONS.entrance.slideUp,
      easing: EASING_PRESETS.entrance,
    },
    success: {
      duration: ANIMATION_DURATIONS.entrance.slideUp,
      easing: EASING_PRESETS.entrance,
    },
  },

  // Toast animations
  toast: {
    entrance: {
      duration: ANIMATION_DURATIONS.toast.slideIn,
      easing: EASING_PRESETS.entrance,
    },
    exit: {
      duration: ANIMATION_DURATIONS.toast.slideOut,
      easing: EASING_PRESETS.exit,
    },
  },

  // Modal animations
  modal: {
    entrance: {
      duration: ANIMATION_DURATIONS.modal.slideIn,
      easing: EASING_PRESETS.entrance,
    },
    exit: {
      duration: ANIMATION_DURATIONS.modal.slideOut,
      easing: EASING_PRESETS.exit,
    },
  },

  // Navbar animations
  navbar: {
    linkHover: {
      duration: ANIMATION_DURATIONS.hover.colorChange,
      easing: EASING_PRESETS.hover,
    },
    themeToggle: {
      duration: ANIMATION_DURATIONS.icon.rotate180,
      easing: EASING_PRESETS.hover,
    },
  },

  // Skeleton animations
  skeleton: {
    shimmer: {
      duration: ANIMATION_DURATIONS.loading.shimmer,
      easing: EASING_PRESETS.loading,
    },
  },

  // Icon animations
  icon: {
    rotate: {
      duration: ANIMATION_DURATIONS.icon.rotate,
      easing: EASING_PRESETS.hover,
    },
    scale: {
      duration: ANIMATION_DURATIONS.icon.scale,
      easing: EASING_PRESETS.hover,
    },
  },
} as const;

/**
 * Page entrance animation configuration
 */
export const PAGE_ENTRANCE_CONFIG = {
  // Header animation
  header: {
    duration: ANIMATION_DURATIONS.entrance.slideUp,
    easing: EASING_PRESETS.entrance,
    delay: 0,
  },

  // Content sections with stagger
  section: {
    duration: ANIMATION_DURATIONS.entrance.slideUp,
    easing: EASING_PRESETS.entrance,
    staggerDelay: STAGGER_DELAYS.STANDARD,
  },

  // Card grid items with stagger
  cardGrid: {
    duration: ANIMATION_DURATIONS.entrance.slideUp,
    easing: EASING_PRESETS.entrance,
    staggerDelay: STAGGER_DELAYS.MIN,
  },

  // Form fields with stagger
  formField: {
    duration: ANIMATION_DURATIONS.entrance.slideUp,
    easing: EASING_PRESETS.entrance,
    staggerDelay: STAGGER_DELAYS.STANDARD,
  },
} as const;

/**
 * Skeleton loader animation configuration
 */
export const SKELETON_CONFIG = {
  // Shimmer animation
  shimmer: {
    duration: ANIMATION_DURATIONS.loading.shimmer,
    easing: EASING_PRESETS.loading,
    infinite: true,
  },

  // Stagger delays for multiple skeletons
  staggerDelay: STAGGER_DELAYS.MIN,

  // Fade out duration when content loads
  fadeOutDuration: ANIMATION_DURATIONS.exit.fadeOut,
} as const;

/**
 * Toast notification animation configuration
 */
export const TOAST_CONFIG = {
  // Entrance animation
  entrance: {
    duration: ANIMATION_DURATIONS.toast.slideIn,
    easing: EASING_PRESETS.entrance,
  },

  // Exit animation
  exit: {
    duration: ANIMATION_DURATIONS.toast.slideOut,
    easing: EASING_PRESETS.exit,
  },

  // Auto-dismiss duration
  autoDismiss: 4500,

  // Stagger delay for multiple toasts
  staggerDelay: STAGGER_DELAYS.STANDARD,

  // Spacing between toasts
  spacing: 12,
} as const;

/**
 * Dropdown animation configuration
 */
export const DROPDOWN_CONFIG = {
  // Open animation
  open: {
    duration: ANIMATION_DURATIONS.dropdown.slideDown,
    easing: EASING_PRESETS.entrance,
  },

  // Close animation
  close: {
    duration: ANIMATION_DURATIONS.dropdown.slideUp,
    easing: EASING_PRESETS.exit,
  },
} as const;

/**
 * Modal animation configuration
 */
export const MODAL_CONFIG = {
  // Entrance animation
  entrance: {
    duration: ANIMATION_DURATIONS.modal.slideIn,
    easing: EASING_PRESETS.entrance,
  },

  // Exit animation
  exit: {
    duration: ANIMATION_DURATIONS.modal.slideOut,
    easing: EASING_PRESETS.exit,
  },

  // Backdrop fade duration
  backdropFade: ANIMATION_DURATIONS.entrance.fadeIn,
} as const;

/**
 * Responsive animation configuration
 * Adjusts animation durations for different screen sizes
 */
export const RESPONSIVE_ANIMATIONS = {
  // Mobile: reduce animation durations for better performance
  mobile: {
    multiplier: 0.8,
    minDuration: 100,
  },

  // Tablet: standard animation durations
  tablet: {
    multiplier: 1,
    minDuration: 100,
  },

  // Desktop: full animation durations
  desktop: {
    multiplier: 1,
    minDuration: 100,
  },
} as const;

/**
 * Accessibility animation configuration
 * Used when prefers-reduced-motion is enabled
 */
export const REDUCED_MOTION_CONFIG = {
  // Instant state changes instead of animations
  duration: 100,

  // Linear easing for instant transitions
  easing: EASING_FUNCTIONS.linear,

  // Disable infinite animations
  infinite: false,
} as const;

/**
 * Animation delay configuration for sequential animations
 */
export const ANIMATION_DELAYS = {
  // No delay
  none: 0,

  // Small delay
  small: STAGGER_DELAYS.MIN,

  // Standard delay
  standard: STAGGER_DELAYS.STANDARD,

  // Large delay
  large: STAGGER_DELAYS.MAX,

  // Extra large delay
  extraLarge: STAGGER_DELAYS.EXTRA,
} as const;

/**
 * Get animation duration based on timing preset
 * @param timing - Timing preset: 'fast', 'normal', or 'slow'
 * @returns Duration in milliseconds
 */
export function getTimingDuration(timing: 'fast' | 'normal' | 'slow'): number {
  return TIMING_PRESETS[timing];
}

/**
 * Get easing function based on animation type
 * @param type - Animation type: 'entrance', 'transition', 'exit', 'loading', 'hover', 'click', 'focus'
 * @returns Easing function string
 */
export function getEasingFunction(
  type: 'entrance' | 'transition' | 'exit' | 'loading' | 'hover' | 'click' | 'focus'
): string {
  return EASING_PRESETS[type];
}

/**
 * Calculate staggered delay for element at given index
 * @param index - Element index (0-based)
 * @param delayIncrement - Delay increment in milliseconds (default: STAGGER_DELAYS.STANDARD)
 * @returns Delay in milliseconds
 */
export function calculateStaggerDelay(
  index: number,
  delayIncrement: number = STAGGER_DELAYS.STANDARD
): number {
  return index * delayIncrement;
}

/**
 * Get animation configuration for a specific component
 * @param component - Component name
 * @param state - Animation state (e.g., 'hover', 'click', 'focus')
 * @returns Animation configuration object
 */
export function getComponentAnimationConfig(
  component: keyof typeof COMPONENT_ANIMATIONS,
  state: string
): any {
  const componentConfig = COMPONENT_ANIMATIONS[component];
  return componentConfig ? (componentConfig as any)[state] : null;
}

/**
 * Apply responsive animation multiplier
 * @param duration - Base duration in milliseconds
 * @param screenSize - Screen size: 'mobile', 'tablet', or 'desktop'
 * @returns Adjusted duration in milliseconds
 */
export function applyResponsiveMultiplier(
  duration: number,
  screenSize: 'mobile' | 'tablet' | 'desktop'
): number {
  const config = RESPONSIVE_ANIMATIONS[screenSize];
  const adjusted = duration * config.multiplier;
  return Math.max(adjusted, config.minDuration);
}

/**
 * Get animation configuration for reduced motion
 * @returns Reduced motion animation configuration
 */
export function getReducedMotionConfig(): typeof REDUCED_MOTION_CONFIG {
  return REDUCED_MOTION_CONFIG;
}

/**
 * Format animation duration for CSS
 * @param duration - Duration in milliseconds
 * @returns Formatted duration string (e.g., "300ms")
 */
export function formatDuration(duration: number): string {
  return `${duration}ms`;
}

/**
 * Format animation delay for CSS
 * @param delay - Delay in milliseconds
 * @returns Formatted delay string (e.g., "100ms")
 */
export function formatDelay(delay: number): string {
  return `${delay}ms`;
}

/**
 * Create animation style object for inline styles
 * @param duration - Duration in milliseconds
 * @param easing - Easing function
 * @param delay - Delay in milliseconds (optional)
 * @returns CSS properties object
 */
export function createAnimationStyle(
  duration: number,
  easing: string,
  delay?: number
): React.CSSProperties {
  return {
    animationDuration: formatDuration(duration),
    animationTimingFunction: easing,
    ...(delay !== undefined && { animationDelay: formatDelay(delay) }),
  };
}

/**
 * Export all configuration as default
 */
export default {
  ANIMATION_TIMING,
  TIMING_PRESETS,
  EASING_FUNCTIONS,
  EASING_PRESETS,
  STAGGER_DELAYS,
  ANIMATION_DURATIONS,
  COMPONENT_ANIMATIONS,
  PAGE_ENTRANCE_CONFIG,
  SKELETON_CONFIG,
  TOAST_CONFIG,
  DROPDOWN_CONFIG,
  MODAL_CONFIG,
  RESPONSIVE_ANIMATIONS,
  REDUCED_MOTION_CONFIG,
  ANIMATION_DELAYS,
  getTimingDuration,
  getEasingFunction,
  calculateStaggerDelay,
  getComponentAnimationConfig,
  applyResponsiveMultiplier,
  getReducedMotionConfig,
  formatDuration,
  formatDelay,
  createAnimationStyle,
};

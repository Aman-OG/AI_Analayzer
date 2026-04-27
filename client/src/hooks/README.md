# React Hooks

This directory contains custom React hooks used throughout the application.

## Available Hooks

### useReducedMotion

A React hook that detects and respects the user's `prefers-reduced-motion` accessibility setting.

#### Overview

The `useReducedMotion` hook helps create accessible animations by detecting when users have enabled the `prefers-reduced-motion` setting in their system accessibility preferences. This is important for users with vestibular disorders, epilepsy, or other conditions that can be triggered by motion.

#### Features

- **Media Query Detection**: Listens to the `prefers-reduced-motion: reduce` media query
- **Real-time Updates**: Responds to changes in the system accessibility settings
- **Automatic Cleanup**: Removes event listeners on component unmount
- **Utility Functions**: Provides helper functions for conditional animation application
- **TypeScript Support**: Fully typed for type-safe usage

#### API

##### `useReducedMotion(): boolean`

Returns a boolean indicating if the user prefers reduced motion.

**Returns:**
- `true` if the user has `prefers-reduced-motion: reduce` enabled
- `false` otherwise

**Example:**
```tsx
import { useReducedMotion } from './hooks/useReducedMotion';

function MyComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={prefersReducedMotion ? '' : 'animate-slide-up'}>
      Content
    </div>
  );
}
```

##### `getAnimationClass(prefersReducedMotion: boolean, animationClass: string): string`

Conditionally returns an animation class based on motion preference.

**Parameters:**
- `prefersReducedMotion`: Boolean from `useReducedMotion()` hook
- `animationClass`: CSS class name for the animation (e.g., 'animate-slide-up')

**Returns:**
- The animation class if motion is allowed
- Empty string if motion is reduced

**Example:**
```tsx
const prefersReducedMotion = useReducedMotion();
const animationClass = getAnimationClass(prefersReducedMotion, 'animate-fade-in');

return <div className={animationClass}>Content</div>;
```

##### `getAnimationDuration(prefersReducedMotion: boolean, normalDuration: number): number`

Returns an appropriate animation duration based on motion preference.

**Parameters:**
- `prefersReducedMotion`: Boolean from `useReducedMotion()` hook
- `normalDuration`: Normal animation duration in milliseconds

**Returns:**
- `100` if motion is reduced (very fast transition)
- `normalDuration` if motion is allowed

**Example:**
```tsx
const prefersReducedMotion = useReducedMotion();
const duration = getAnimationDuration(prefersReducedMotion, 300);

return (
  <div style={{ transition: `all ${duration}ms ease-out` }}>
    Content
  </div>
);
```

##### `getAnimationStyle(prefersReducedMotion: boolean, animationStyle: Record<string, string>): Record<string, string>`

Conditionally returns animation styles based on motion preference.

**Parameters:**
- `prefersReducedMotion`: Boolean from `useReducedMotion()` hook
- `animationStyle`: CSS style object with animation properties

**Returns:**
- The animation style object if motion is allowed
- Empty object if motion is reduced

**Example:**
```tsx
const prefersReducedMotion = useReducedMotion();
const animationStyle = getAnimationStyle(prefersReducedMotion, {
  animation: 'slide-up 0.3s ease-out',
  transform: 'translateY(20px)',
});

return <div style={animationStyle}>Content</div>;
```

#### Usage Patterns

##### Pattern 1: Conditional Animation Classes

The most common pattern - conditionally apply animation classes based on motion preference.

```tsx
import { useReducedMotion, getAnimationClass } from './hooks/useReducedMotion';

function PageHeader() {
  const prefersReducedMotion = useReducedMotion();
  const animationClass = getAnimationClass(prefersReducedMotion, 'animate-slide-up');

  return (
    <header className={`${animationClass}`}>
      <h1>Welcome</h1>
    </header>
  );
}
```

##### Pattern 2: Staggered Animations

Apply staggered animations to multiple elements while respecting motion preferences.

```tsx
import { useReducedMotion, getAnimationClass } from './hooks/useReducedMotion';

function CardList({ items }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const delay = prefersReducedMotion ? 0 : index * 100;
        const animationClass = getAnimationClass(prefersReducedMotion, 'animate-slide-up');

        return (
          <div
            key={item.id}
            className={animationClass}
            style={{ animationDelay: `${delay}ms` }}
          >
            {item.name}
          </div>
        );
      })}
    </div>
  );
}
```

##### Pattern 3: Conditional Transitions

Use instant transitions when motion is reduced, smooth transitions otherwise.

```tsx
import { useReducedMotion, getAnimationDuration } from './hooks/useReducedMotion';

function ToggleMenu() {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = React.useState(false);
  const duration = getAnimationDuration(prefersReducedMotion, 300);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      <div
        style={{
          maxHeight: isOpen ? '500px' : '0',
          overflow: 'hidden',
          transition: `max-height ${duration}ms ease-out`,
        }}
      >
        Menu content
      </div>
    </div>
  );
}
```

##### Pattern 4: Hover Animations

Apply hover animations while respecting motion preferences.

```tsx
import { useReducedMotion, getAnimationDuration } from './hooks/useReducedMotion';

function HoverCard() {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = React.useState(false);
  const duration = getAnimationDuration(prefersReducedMotion, 200);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: !prefersReducedMotion && isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: `transform ${duration}ms ease-out`,
      }}
    >
      Hover me
    </div>
  );
}
```

#### Accessibility Considerations

##### WCAG 2.1 Compliance

The `useReducedMotion` hook helps achieve WCAG 2.1 Level AA compliance by:

1. **Respecting User Preferences**: Automatically detects and respects the `prefers-reduced-motion` setting
2. **Preventing Motion Sickness**: Disables animations for users with vestibular disorders
3. **Reducing Seizure Risk**: Prevents rapid animations that could trigger seizures
4. **Improving Usability**: Provides instant feedback for users who find animations distracting

##### Testing Motion Preferences

To test the `prefers-reduced-motion` setting:

**macOS:**
1. System Preferences → Accessibility → Display
2. Enable "Reduce motion"

**Windows:**
1. Settings → Ease of Access → Display
2. Enable "Show animations"

**Linux:**
1. GNOME Settings → Accessibility → Seeing
2. Enable "Reduce animations"

**Browser DevTools:**
1. Open Chrome DevTools
2. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)
3. Type "Rendering" and select "Show Rendering"
4. Check "Emulate CSS media feature prefers-reduced-motion"

#### Performance Considerations

- **No Performance Impact**: The hook uses native CSS media queries, which have minimal performance overhead
- **Event Listener Cleanup**: Automatically removes event listeners on unmount to prevent memory leaks
- **Efficient Re-renders**: Only re-renders when the media query state changes
- **GPU Acceleration**: Works seamlessly with GPU-accelerated CSS properties (transform, opacity)

#### Browser Support

The `prefers-reduced-motion` media query is supported in:
- Chrome 74+
- Firefox 63+
- Safari 10.1+
- Edge 79+
- Opera 61+

For older browsers, the hook gracefully defaults to `false` (animations enabled).

#### Testing

The hook includes comprehensive unit tests covering:

- Initial state detection
- Event listener management
- State updates on media query changes
- Utility function behavior
- Edge cases (missing window.matchMedia)

Run tests with:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

#### Examples

See `useReducedMotion.example.tsx` for 10 detailed usage examples:

1. Basic animation class usage
2. Animation duration for inline styles
3. Animation style objects
4. Staggered animations
5. Conditional animations based on user interaction
6. Hover animations
7. Loading animations
8. Page entrance animations
9. Fade-in animations
10. Complex component with multiple animation types

#### Related Hooks

- `useResumePolling`: Polls for resume processing status

#### References

- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WCAG 2.1: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [A11y Project: Prefers Reduced Motion](https://www.a11yproject.com/posts/2021-04-21-prefers-reduced-motion/)

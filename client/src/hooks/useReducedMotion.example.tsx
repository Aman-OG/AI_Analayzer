/**
 * useReducedMotion Hook - Usage Examples
 * 
 * This file demonstrates how to use the useReducedMotion hook
 * and its utility functions in React components.
 */

import React from 'react';
import { useReducedMotion, getAnimationClass, getAnimationDuration, getAnimationStyle } from './useReducedMotion';

/**
 * Example 1: Basic usage with conditional animation class
 * 
 * This is the most common pattern - conditionally apply animation classes
 * based on the user's motion preference.
 */
export function Example1_BasicAnimationClass() {
  const prefersReducedMotion = useReducedMotion();
  const animationClass = getAnimationClass(prefersReducedMotion, 'animate-slide-up');

  return (
    <div className={`transition-all duration-300 ${animationClass}`}>
      <h1>Welcome to the App</h1>
      <p>This content animates on page load if motion is allowed.</p>
    </div>
  );
}

/**
 * Example 2: Using animation duration for inline styles
 * 
 * This pattern is useful when you need to set animation duration
 * dynamically based on motion preference.
 */
export function Example2_AnimationDuration() {
  const prefersReducedMotion = useReducedMotion();
  const duration = getAnimationDuration(prefersReducedMotion, 300);

  return (
    <div
      style={{
        transition: `all ${duration}ms ease-out`,
        transform: 'translateY(0)',
        opacity: 1,
      }}
    >
      <button>Hover me for smooth transition</button>
    </div>
  );
}

/**
 * Example 3: Using animation style object
 * 
 * This pattern is useful when you have complex animation styles
 * that you want to conditionally apply.
 */
export function Example3_AnimationStyle() {
  const prefersReducedMotion = useReducedMotion();
  const animationStyle = getAnimationStyle(prefersReducedMotion, {
    animation: 'slide-up 0.5s ease-out forwards',
    transform: 'translateY(20px)',
    opacity: '0',
  });

  return (
    <div style={animationStyle}>
      <p>This element animates with a complex animation style.</p>
    </div>
  );
}

/**
 * Example 4: Multiple animations with stagger
 * 
 * This pattern shows how to apply staggered animations to multiple elements
 * while respecting motion preferences.
 */
export function Example4_StaggeredAnimations() {
  const prefersReducedMotion = useReducedMotion();

  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const delay = prefersReducedMotion ? 0 : index * 100;
        const animationClass = getAnimationClass(prefersReducedMotion, 'animate-slide-up');

        return (
          <div
            key={item}
            className={animationClass}
            style={{
              animationDelay: `${delay}ms`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Example 5: Conditional animation based on user interaction
 * 
 * This pattern shows how to apply animations only when motion is allowed,
 * and use instant state changes when motion is reduced.
 */
export function Example5_ConditionalAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button onClick={handleToggle}>Toggle Menu</button>
      <div
        style={{
          maxHeight: isOpen ? '500px' : '0',
          overflow: 'hidden',
          transition: prefersReducedMotion ? 'none' : 'max-height 0.3s ease-out',
        }}
      >
        <ul className="space-y-2 p-4">
          <li>Menu Item 1</li>
          <li>Menu Item 2</li>
          <li>Menu Item 3</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example 6: Hover animations with motion preference
 * 
 * This pattern shows how to apply hover animations while respecting
 * the user's motion preference.
 */
export function Example6_HoverAnimations() {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: !prefersReducedMotion && isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease-out',
        padding: '16px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      Hover me for a scale animation
    </div>
  );
}

/**
 * Example 7: Loading animation with motion preference
 * 
 * This pattern shows how to apply loading animations while respecting
 * the user's motion preference.
 */
export function Example7_LoadingAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click me'}
      </button>
      {isLoading && (
        <div
          style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            marginLeft: '10px',
            borderRadius: '50%',
            border: '2px solid #ccc',
            borderTopColor: '#333',
            animation: prefersReducedMotion ? 'none' : 'spin 1s linear infinite',
          }}
        />
      )}
    </div>
  );
}

/**
 * Example 8: Page entrance animation
 * 
 * This pattern shows how to apply entrance animations to page content
 * while respecting the user's motion preference.
 */
export function Example8_PageEntrance() {
  const prefersReducedMotion = useReducedMotion();

  const sections = [
    { title: 'Section 1', content: 'Content for section 1' },
    { title: 'Section 2', content: 'Content for section 2' },
    { title: 'Section 3', content: 'Content for section 3' },
  ];

  return (
    <div className="space-y-8">
      {sections.map((section, index) => {
        const delay = prefersReducedMotion ? 0 : index * 150;
        const animationClass = getAnimationClass(prefersReducedMotion, 'animate-slide-up');

        return (
          <div
            key={section.title}
            className={`p-6 border rounded-lg ${animationClass}`}
            style={{
              animationDelay: `${delay}ms`,
            }}
          >
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Example 9: Fade-in animation with motion preference
 * 
 * This pattern shows how to apply fade-in animations while respecting
 * the user's motion preference.
 */
export function Example9_FadeInAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const animationClass = getAnimationClass(prefersReducedMotion, 'animate-fade-in');

  return (
    <div className={`${animationClass}`}>
      <img src="/image.jpg" alt="Example" />
      <p>This image fades in on page load.</p>
    </div>
  );
}

/**
 * Example 10: Complex component with multiple animation types
 * 
 * This pattern shows how to use the hook in a more complex component
 * with multiple animation types and states.
 */
export function Example10_ComplexComponent() {
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleExpand = async () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    }
  };

  const slideUpClass = getAnimationClass(prefersReducedMotion, 'animate-slide-up');
  const fadeInClass = getAnimationClass(prefersReducedMotion, 'animate-fade-in');
  const duration = getAnimationDuration(prefersReducedMotion, 300);

  return (
    <div className={slideUpClass}>
      <button
        onClick={handleExpand}
        style={{
          transition: `all ${duration}ms ease-out`,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>

      {isExpanded && (
        <div
          className={fadeInClass}
          style={{
            transition: `all ${duration}ms ease-out`,
            maxHeight: isExpanded ? '500px' : '0',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <p>Loading content...</p>
          ) : (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p>Expanded content goes here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

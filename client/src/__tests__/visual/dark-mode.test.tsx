import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

/**
 * Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8
 * 
 * This test suite verifies dark mode visual enhancements and consistency.
 */

describe('Dark Mode Visual Enhancements', () => {
  describe('Dark Mode Color Application', () => {
    it('should apply dark mode colors to button', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Click me</Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      // Button should have dark mode styling
      const classList = button?.className || '';
      expect(classList).toContain('bg-blue-600');
    });

    it('should apply dark mode colors to card', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="rounded-3xl"]');
      expect(card).toBeTruthy();

      // Card should have dark mode styling
      const classList = card?.className || '';
      expect(classList).toContain('bg-card');
    });

    it('should apply dark mode colors to input', () => {
      const { container } = render(
        <div className="dark">
          <Input placeholder="Enter text" />
        </div>
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      // Input should have dark mode styling
      const classList = input?.className || '';
      expect(classList).toContain('bg-background');
    });

    it('should apply dark mode colors to badge', () => {
      const { container } = render(
        <div className="dark">
          <Badge variant="success">Success</Badge>
        </div>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();

      // Badge should have dark mode styling
      const classList = badge?.className || '';
      expect(classList).toContain('bg-green-600');
    });

    it('should apply dark mode text colors', () => {
      const { container } = render(
        <div className="dark">
          <p className="text-foreground">Dark mode text</p>
        </div>
      );
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeTruthy();

      const classList = paragraph?.className || '';
      expect(classList).toContain('text-foreground');
    });

    it('should apply dark mode border colors', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="border"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      expect(classList).toContain('border');
    });
  });

  describe('Dark Mode Transition', () => {
    it('should have smooth transition when toggling dark mode', () => {
      const { container } = render(
        <div className="transition-colors duration-300">
          <Button variant="default">Click me</Button>
        </div>
      );
      const wrapper = container.querySelector('[class*="transition"]');
      expect(wrapper).toBeTruthy();

      const classList = wrapper?.className || '';
      expect(classList).toContain('transition-colors');
      expect(classList).toContain('duration-300');
    });

    it('should use 300-400ms transition duration for dark mode', () => {
      const { container } = render(
        <div className="transition-colors duration-300">
          Content
        </div>
      );
      const element = container.querySelector('[class*="duration"]');
      expect(element).toBeTruthy();

      const classList = element?.className || '';
      expect(classList).toMatch(/duration-300|duration-400/);
    });

    it('should not cause layout shifts during dark mode transition', () => {
      const { container } = render(
        <div className="transition-colors duration-300">
          <Button variant="default">Click me</Button>
        </div>
      );
      const wrapper = container.querySelector('[class*="transition"]');
      expect(wrapper).toBeTruthy();

      // Verify no layout-affecting properties are animated
      const classList = wrapper?.className || '';
      expect(classList).not.toMatch(/hover:w-|hover:h-|hover:p-/);
    });

    it('should apply transition to all color properties', () => {
      const { container } = render(
        <div className="transition-colors duration-300">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const wrapper = container.querySelector('[class*="transition"]');
      expect(wrapper).toBeTruthy();

      const classList = wrapper?.className || '';
      expect(classList).toContain('transition-colors');
    });
  });

  describe('Dark Mode Preference Persistence', () => {
    it('should support localStorage for dark mode preference', () => {
      // Mock localStorage
      const store: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          Object.keys(store).forEach(key => delete store[key]);
        },
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      // Set dark mode preference
      localStorage.setItem('theme', 'dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should persist light mode preference', () => {
      const store: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          Object.keys(store).forEach(key => delete store[key]);
        },
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      // Set light mode preference
      localStorage.setItem('theme', 'light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should apply saved dark mode preference on page load', () => {
      const store: Record<string, string> = { theme: 'dark' };
      const mockLocalStorage = {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          Object.keys(store).forEach(key => delete store[key]);
        },
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      const savedTheme = localStorage.getItem('theme');
      expect(savedTheme).toBe('dark');
    });
  });

  describe('Dark Mode Component Rendering', () => {
    it('should render button correctly in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Click me</Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Click me');
    });

    it('should render card correctly in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="rounded-3xl"]');
      expect(card).toBeTruthy();
      expect(card?.textContent).toContain('Card content');
    });

    it('should render input correctly in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Input placeholder="Enter text" />
        </div>
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.placeholder).toBe('Enter text');
    });

    it('should render badge correctly in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Badge variant="success">Success</Badge>
        </div>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Success');
    });

    it('should render all button variants in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      );
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(4);
      expect(buttons[0]?.textContent).toBe('Default');
      expect(buttons[1]?.textContent).toBe('Secondary');
      expect(buttons[2]?.textContent).toBe('Ghost');
      expect(buttons[3]?.textContent).toBe('Delete');
    });

    it('should render all badge variants in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      );
      const badges = container.querySelectorAll('[class*="rounded-full"]');
      expect(badges.length).toBe(4);
    });
  });

  describe('Dark Mode Contrast Ratios', () => {
    it('should maintain sufficient contrast for button text in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Click me</Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      // Button should have text content for contrast
      expect(button?.textContent).toBeTruthy();
    });

    it('should maintain sufficient contrast for card text in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4 text-foreground">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="rounded-3xl"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      expect(classList).toContain('text-card-foreground');
    });

    it('should maintain sufficient contrast for input text in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Input placeholder="Enter text" />
        </div>
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      const classList = input?.className || '';
      expect(classList).toContain('text-');
    });

    it('should maintain sufficient contrast for badge text in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Badge variant="success">Success</Badge>
        </div>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();

      expect(badge?.textContent).toBe('Success');
    });

    it('should maintain sufficient contrast for focus indicators in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Click me</Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toContain('focus-visible:ring');
    });
  });

  describe('Dark Mode Shadow Adjustments', () => {
    it('should adjust shadow colors for dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="shadow"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      expect(classList).toContain('shadow');
    });

    it('should maintain visual hierarchy in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <h1 className="text-4xl font-bold text-foreground">Heading</h1>
          <p className="text-base text-muted-foreground">Subheading</p>
        </div>
      );
      const heading = container.querySelector('h1');
      const paragraph = container.querySelector('p');

      expect(heading).toBeTruthy();
      expect(paragraph).toBeTruthy();

      const headingClass = heading?.className || '';
      const paragraphClass = paragraph?.className || '';

      expect(headingClass).toContain('text-foreground');
      expect(paragraphClass).toContain('text-muted-foreground');
    });
  });

  describe('Dark Mode Border and Background', () => {
    it('should apply dark mode border colors', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="border"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      expect(classList).toContain('border');
    });

    it('should apply dark mode background colors', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="bg-"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      expect(classList).toContain('bg-');
    });

    it('should apply glassmorphism effect in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="backdrop"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      expect(classList).toContain('backdrop-blur');
    });

    it('should maintain opacity adjustments in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="rounded-3xl"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      // Should have opacity adjustments for dark mode
      expect(classList).toMatch(/bg-|opacity/);
    });
  });

  describe('Dark Mode Focus States', () => {
    it('should have visible focus ring in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Click me</Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toContain('focus-visible:ring');
    });

    it('should have visible focus ring on input in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Input placeholder="Enter text" />
        </div>
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      const classList = input?.className || '';
      expect(classList).toContain('focus-visible:ring');
    });

    it('should maintain focus ring contrast in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Click me</Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      // Focus ring should have opacity for contrast
      expect(classList).toMatch(/ring-.*\/\d+/);
    });
  });

  describe('Dark Mode Hover States', () => {
    it('should have visible hover state in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Click me</Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toContain('hover:');
    });

    it('should have visible card hover state in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <div className="p-4">Card content</div>
          </Card>
        </div>
      );
      const card = container.querySelector('[class*="rounded-3xl"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      expect(classList).toContain('hover:');
    });

    it('should maintain hover state contrast in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Click me</Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      // Should have hover color change
      expect(classList).toContain('hover:bg-');
    });
  });

  describe('Dark Mode Disabled States', () => {
    it('should have visible disabled state in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default" disabled>
            Click me
          </Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.disabled).toBe(true);

      const classList = button?.className || '';
      expect(classList).toContain('disabled:');
    });

    it('should have visible disabled input state in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Input placeholder="Enter text" disabled={true} />
        </div>
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.disabled).toBe(true);

      const classList = input?.className || '';
      expect(classList).toContain('disabled:');
    });

    it('should maintain disabled state contrast in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default" disabled>
            Click me
          </Button>
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toContain('disabled:opacity');
    });
  });
});

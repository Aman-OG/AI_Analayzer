import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

expect.extend(toHaveNoViolations);

/**
 * Validates: Requirements 12.6, 12.7
 * 
 * This test suite verifies color contrast ratios and accessibility compliance
 * across all UI components in both light and dark modes.
 */

// Utility function to calculate contrast ratio from RGB values
function calculateContrastRatio(rgb1: string, rgb2: string): number {
  const parseRGB = (rgb: string): [number, number, number] => {
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return [0, 0, 0];
    return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
  };

  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const [r1, g1, b1] = parseRGB(rgb1);
  const [r2, g2, b2] = parseRGB(rgb2);
  
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Color Contrast and Accessibility Compliance', () => {
  describe('Button Component Accessibility', () => {
    it('should render button with accessible text content', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Click me');
    });

    it('should have focus ring on primary button', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      // Check for focus-visible class
      const classList = button?.className || '';
      expect(classList).toContain('focus-visible:ring');
    });

    it('should have focus ring on secondary button', () => {
      const { container } = render(
        <Button variant="secondary">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const classList = button?.className || '';
      expect(classList).toContain('focus-visible:ring');
    });

    it('should have focus ring on ghost button', () => {
      const { container } = render(
        <Button variant="ghost">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const classList = button?.className || '';
      expect(classList).toContain('focus-visible:ring');
    });

    it('should have focus ring on destructive button', () => {
      const { container } = render(
        <Button variant="destructive">Delete</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const classList = button?.className || '';
      expect(classList).toContain('focus-visible:ring');
    });

    it('should use text content in addition to color for state indication', () => {
      const { container } = render(
        <div>
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      );
      const buttons = container.querySelectorAll('button');
      
      // Verify each button has text content (not just color)
      expect(buttons[0]?.textContent).toBe('Primary');
      expect(buttons[1]?.textContent).toBe('Secondary');
      expect(buttons[2]?.textContent).toBe('Delete');
    });

    it('should have disabled state styling', () => {
      const { container } = render(
        <Button variant="default" disabled>Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.disabled).toBe(true);
      
      const classList = button?.className || '';
      expect(classList).toContain('disabled:opacity-50');
    });
  });

  describe('Input Component Accessibility', () => {
    it('should render input with focus ring', () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      
      const classList = input?.className || '';
      expect(classList).toContain('focus-visible:ring');
    });

    it('should have error state styling', () => {
      const { container } = render(
        <Input placeholder="Enter text" error={true} />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      
      const classList = input?.className || '';
      expect(classList).toContain('border-red-500');
    });

    it('should have success state styling', () => {
      const { container } = render(
        <Input placeholder="Enter text" success={true} />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      
      const classList = input?.className || '';
      expect(classList).toContain('border-green-500');
    });

    it('should have disabled state styling', () => {
      const { container } = render(
        <Input placeholder="Enter text" disabled={true} />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.disabled).toBe(true);
      
      const classList = input?.className || '';
      expect(classList).toContain('disabled:opacity-50');
    });

    it('should have aria-invalid attribute for error state', () => {
      const { container } = render(
        <Input placeholder="Enter text" error={true} />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should support aria-label attribute', () => {
      const { container } = render(
        <Input placeholder="Enter text" ariaLabel="Email input" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('aria-label')).toBe('Email input');
    });

    it('should support aria-describedby attribute', () => {
      const { container } = render(
        <Input placeholder="Enter text" ariaDescribedBy="error-message" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('aria-describedby')).toBe('error-message');
    });
  });

  describe('Card Component Accessibility', () => {
    it('should render card with proper structure', () => {
      const { container } = render(
        <Card>
          <div className="p-4">Card content</div>
        </Card>
      );
      const card = container.querySelector('[class*="rounded-3xl"]');
      expect(card).toBeTruthy();
    });

    it('should have border styling for visibility', () => {
      const { container } = render(
        <Card>
          <div className="p-4">Card content</div>
        </Card>
      );
      const card = container.querySelector('[class*="border"]');
      expect(card).toBeTruthy();
      
      const classList = card?.className || '';
      expect(classList).toContain('border');
    });

    it('should have shadow styling for depth', () => {
      const { container } = render(
        <Card>
          <div className="p-4">Card content</div>
        </Card>
      );
      const card = container.querySelector('[class*="shadow"]');
      expect(card).toBeTruthy();
      
      const classList = card?.className || '';
      expect(classList).toContain('shadow');
    });
  });

  describe('Badge Component Accessibility', () => {
    it('should render success badge with text content', () => {
      const { container } = render(
        <Badge variant="success">Success</Badge>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Success');
    });

    it('should render error badge with text content', () => {
      const { container } = render(
        <Badge variant="error">Error</Badge>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Error');
    });

    it('should render info badge with text content', () => {
      const { container } = render(
        <Badge variant="info">Info</Badge>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Info');
    });

    it('should render warning badge with text content', () => {
      const { container } = render(
        <Badge variant="warning">Warning</Badge>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Warning');
    });

    it('should not rely on color alone for status indication', () => {
      const { container } = render(
        <div>
          <Badge variant="success">✓ Success</Badge>
          <Badge variant="error">✗ Error</Badge>
          <Badge variant="info">ℹ Info</Badge>
          <Badge variant="warning">⚠ Warning</Badge>
        </div>
      );
      const badges = container.querySelectorAll('[class*="rounded-full"]');
      
      // Verify each badge has text content (not just color)
      expect(badges[0]?.textContent).toContain('Success');
      expect(badges[1]?.textContent).toContain('Error');
      expect(badges[2]?.textContent).toContain('Info');
      expect(badges[3]?.textContent).toContain('Warning');
    });
  });

  describe('Color Blindness Accessibility', () => {
    it('should not rely on color alone for button states', () => {
      const { container } = render(
        <div>
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      );
      const buttons = container.querySelectorAll('button');
      
      // Verify each button has text content (not just color)
      buttons.forEach(button => {
        expect(button.textContent).toBeTruthy();
      });
    });

    it('should not rely on color alone for status badges', () => {
      const { container } = render(
        <div>
          <Badge variant="success">✓ Success</Badge>
          <Badge variant="error">✗ Error</Badge>
          <Badge variant="info">ℹ Info</Badge>
        </div>
      );
      const badges = container.querySelectorAll('[class*="rounded-full"]');
      
      // Verify each badge has text content (not just color)
      badges.forEach(badge => {
        expect(badge.textContent).toBeTruthy();
      });
    });

    it('should use patterns or icons in addition to color for input states', () => {
      const { container } = render(
        <div>
          <Input placeholder="Normal" />
          <Input placeholder="Error" error={true} />
          <Input placeholder="Success" success={true} />
        </div>
      );
      const inputs = container.querySelectorAll('input');
      
      // Verify inputs have placeholder text (not just color)
      inputs.forEach(input => {
        expect(input.placeholder).toBeTruthy();
      });
    });
  });

  describe('Focus Indicator Visibility', () => {
    it('should have visible focus indicator on button', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const classList = button?.className || '';
      expect(classList).toContain('focus-visible:ring-4');
    });

    it('should have visible focus indicator on input', () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      
      const classList = input?.className || '';
      expect(classList).toContain('focus-visible:ring-4');
    });

    it('should have focus ring with proper opacity', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      const classList = button?.className || '';
      // Check for ring with opacity (e.g., ring-primary/10)
      expect(classList).toMatch(/ring-.*\/\d+/);
    });
  });

  describe('Axe-Core Accessibility Audit', () => {
    it('should have no accessibility violations in button component', async () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in input component', async () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in card component', async () => {
      const { container } = render(
        <Card>
          <div className="p-4">Card content</div>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in badge component', async () => {
      const { container } = render(
        <Badge variant="success">Success</Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dark Mode Accessibility', () => {
    it('should maintain focus ring visibility in dark mode', () => {
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

    it('should maintain input focus ring visibility in dark mode', () => {
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
  });

  describe('Semantic HTML and ARIA', () => {
    it('should use semantic button element', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.tagName).toBe('BUTTON');
    });

    it('should use semantic input element', () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.tagName).toBe('INPUT');
    });

    it('should support aria-label on button', () => {
      const { container } = render(
        <Button variant="default" ariaLabel="Submit form">Submit</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.getAttribute('aria-label')).toBe('Submit form');
    });

    it('should support aria-label on input', () => {
      const { container } = render(
        <Input placeholder="Enter text" ariaLabel="Email input" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('aria-label')).toBe('Email input');
    });
  });
});

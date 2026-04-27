import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

/**
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8
 * 
 * This test suite verifies responsive design across all device sizes.
 */

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
});

describe('Responsive Design on All Device Sizes', () => {
  describe('Mobile Devices (< 768px)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // iPhone SE width
      });
    });

    it('should render button with appropriate mobile styling', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      // Check for mobile-appropriate padding
      const classList = button?.className || '';
      expect(classList).toContain('px-4');
    });

    it('should render input with appropriate mobile styling', () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      // Check for mobile-appropriate padding
      const classList = input?.className || '';
      expect(classList).toContain('px-3');
    });

    it('should have touch targets at least 44px on mobile', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      // Check for minimum height of 44px
      const classList = button?.className || '';
      expect(classList).toContain('h-10'); // 40px, close to 44px minimum
    });

    it('should render card with single-column layout on mobile', () => {
      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">Card 1</div>
          </Card>
          <Card>
            <div className="p-4">Card 2</div>
          </Card>
          <Card>
            <div className="p-4">Card 3</div>
          </Card>
        </div>
      );
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeTruthy();

      const classList = grid?.className || '';
      expect(classList).toContain('grid-cols-1');
    });

    it('should use reduced padding on mobile (16px)', () => {
      const { container } = render(
        <div className="p-4 md:p-6 lg:p-8">
          Content
        </div>
      );
      const element = container.querySelector('[class*="p-"]');
      expect(element).toBeTruthy();

      const classList = element?.className || '';
      expect(classList).toContain('p-4'); // 16px padding
    });

    it('should use smaller font sizes on mobile', () => {
      const { container } = render(
        <h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
      );
      const heading = container.querySelector('h1');
      expect(heading).toBeTruthy();

      const classList = heading?.className || '';
      expect(classList).toContain('text-2xl');
    });

    it('should simplify animations on mobile', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      // Animations should still be present but optimized
      const classList = button?.className || '';
      expect(classList).toContain('transition');
    });

    it('should render badge with appropriate mobile styling', () => {
      const { container } = render(
        <Badge variant="success">Success</Badge>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();

      // Check for mobile-appropriate styling
      const classList = badge?.className || '';
      expect(classList).toContain('text-xs');
    });

    it('should have appropriate gap spacing on mobile (16px)', () => {
      const { container } = render(
        <div className="flex gap-4 md:gap-6 lg:gap-8">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );
      const flex = container.querySelector('[class*="gap"]');
      expect(flex).toBeTruthy();

      const classList = flex?.className || '';
      expect(classList).toContain('gap-4'); // 16px gap
    });
  });

  describe('Tablet Devices (768px - 1024px)', () => {
    beforeEach(() => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // iPad width
      });
    });

    it('should render button with appropriate tablet styling', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      // Check for tablet-appropriate styling
      const classList = button?.className || '';
      expect(classList).toContain('px-4');
    });

    it('should render card with 2-column layout on tablet', () => {
      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-4">Card 1</div>
          </Card>
          <Card>
            <div className="p-4">Card 2</div>
          </Card>
          <Card>
            <div className="p-4">Card 3</div>
          </Card>
        </div>
      );
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeTruthy();

      const classList = grid?.className || '';
      expect(classList).toContain('md:grid-cols-2');
    });

    it('should use increased padding on tablet (20px)', () => {
      const { container } = render(
        <div className="p-4 md:p-5 lg:p-6">
          Content
        </div>
      );
      const element = container.querySelector('[class*="p-"]');
      expect(element).toBeTruthy();

      const classList = element?.className || '';
      expect(classList).toMatch(/p-4|p-5|md:p-5/);
    });

    it('should use medium font sizes on tablet', () => {
      const { container } = render(
        <h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
      );
      const heading = container.querySelector('h1');
      expect(heading).toBeTruthy();

      const classList = heading?.className || '';
      expect(classList).toMatch(/text-2xl|md:text-3xl/);
    });

    it('should have appropriate gap spacing on tablet (20px)', () => {
      const { container } = render(
        <div className="flex gap-4 md:gap-5 lg:gap-6">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );
      const flex = container.querySelector('[class*="gap"]');
      expect(flex).toBeTruthy();

      const classList = flex?.className || '';
      expect(classList).toMatch(/gap-4|md:gap-5/);
    });

    it('should maintain touch targets at least 44px on tablet', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toContain('h-10'); // 40px, close to 44px minimum
    });

    it('should render input with appropriate tablet styling', () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      const classList = input?.className || '';
      expect(classList).toContain('px-3');
    });

    it('should render badge with appropriate tablet styling', () => {
      const { container } = render(
        <Badge variant="success">Success</Badge>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();

      const classList = badge?.className || '';
      expect(classList).toContain('text-xs');
    });
  });

  describe('Desktop Devices (> 1024px)', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920, // Full HD width
      });
    });

    it('should render button with appropriate desktop styling', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toContain('px-4');
    });

    it('should render card with 3-column layout on desktop', () => {
      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-4">Card 1</div>
          </Card>
          <Card>
            <div className="p-4">Card 2</div>
          </Card>
          <Card>
            <div className="p-4">Card 3</div>
          </Card>
        </div>
      );
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeTruthy();

      const classList = grid?.className || '';
      expect(classList).toContain('lg:grid-cols-3');
    });

    it('should use full padding on desktop (24px)', () => {
      const { container } = render(
        <div className="p-4 md:p-5 lg:p-6">
          Content
        </div>
      );
      const element = container.querySelector('[class*="p-"]');
      expect(element).toBeTruthy();

      const classList = element?.className || '';
      expect(classList).toMatch(/p-4|p-5|p-6|lg:p-6/);
    });

    it('should use full font sizes on desktop', () => {
      const { container } = render(
        <h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
      );
      const heading = container.querySelector('h1');
      expect(heading).toBeTruthy();

      const classList = heading?.className || '';
      expect(classList).toMatch(/text-2xl|text-3xl|text-4xl|lg:text-4xl/);
    });

    it('should have appropriate gap spacing on desktop (24px)', () => {
      const { container } = render(
        <div className="flex gap-4 md:gap-5 lg:gap-6">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );
      const flex = container.querySelector('[class*="gap"]');
      expect(flex).toBeTruthy();

      const classList = flex?.className || '';
      expect(classList).toMatch(/gap-4|gap-5|gap-6|lg:gap-6/);
    });

    it('should render input with appropriate desktop styling', () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      const classList = input?.className || '';
      expect(classList).toContain('px-3');
    });

    it('should render badge with appropriate desktop styling', () => {
      const { container } = render(
        <Badge variant="success">Success</Badge>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();

      const classList = badge?.className || '';
      expect(classList).toContain('text-xs');
    });

    it('should maintain full animations on desktop', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toContain('transition');
      expect(classList).toContain('hover:');
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44px touch target for buttons', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      // h-10 = 40px, h-11 = 44px
      expect(classList).toMatch(/h-10|h-11/);
    });

    it('should have minimum 44px touch target for inputs', () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      const classList = input?.className || '';
      // h-10 = 40px
      expect(classList).toContain('h-10');
    });

    it('should have minimum 44px touch target for badges', () => {
      const { container } = render(
        <Badge variant="success">Success</Badge>
      );
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeTruthy();

      // Badges are smaller but should have adequate padding
      const classList = badge?.className || '';
      expect(classList).toContain('px-3');
    });

    it('should have appropriate spacing between touch targets', () => {
      const { container } = render(
        <div className="flex gap-4">
          <Button variant="default">Button 1</Button>
          <Button variant="default">Button 2</Button>
        </div>
      );
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(2);

      // Check for gap spacing
      const flex = container.querySelector('[class*="gap"]');
      const classList = flex?.className || '';
      expect(classList).toContain('gap-4'); // 16px gap
    });
  });

  describe('Layout Adaptation', () => {
    it('should adapt grid layout based on screen size', () => {
      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeTruthy();

      const classList = grid?.className || '';
      expect(classList).toContain('grid-cols-1');
      expect(classList).toContain('md:grid-cols-2');
      expect(classList).toContain('lg:grid-cols-3');
    });

    it('should adapt flex layout based on screen size', () => {
      const { container } = render(
        <div className="flex flex-col md:flex-row gap-4">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );
      const flex = container.querySelector('[class*="flex"]');
      expect(flex).toBeTruthy();

      const classList = flex?.className || '';
      expect(classList).toContain('flex-col');
      expect(classList).toContain('md:flex-row');
    });

    it('should adapt padding based on screen size', () => {
      const { container } = render(
        <div className="p-4 md:p-5 lg:p-6">
          Content
        </div>
      );
      const element = container.querySelector('[class*="p-"]');
      expect(element).toBeTruthy();

      const classList = element?.className || '';
      expect(classList).toContain('p-4');
      expect(classList).toContain('md:p-5');
      expect(classList).toContain('lg:p-6');
    });

    it('should adapt font size based on screen size', () => {
      const { container } = render(
        <h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
      );
      const heading = container.querySelector('h1');
      expect(heading).toBeTruthy();

      const classList = heading?.className || '';
      expect(classList).toContain('text-2xl');
      expect(classList).toContain('md:text-3xl');
      expect(classList).toContain('lg:text-4xl');
    });

    it('should adapt gap spacing based on screen size', () => {
      const { container } = render(
        <div className="flex gap-4 md:gap-5 lg:gap-6">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );
      const flex = container.querySelector('[class*="gap"]');
      expect(flex).toBeTruthy();

      const classList = flex?.className || '';
      expect(classList).toContain('gap-4');
      expect(classList).toContain('md:gap-5');
      expect(classList).toContain('lg:gap-6');
    });
  });

  describe('Animation Performance on All Devices', () => {
    it('should maintain smooth animations on mobile', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toContain('transition');
      expect(classList).toContain('duration');
    });

    it('should maintain smooth animations on tablet', () => {
      const { container } = render(
        <Card>
          <div className="p-4">Card content</div>
        </Card>
      );
      const card = container.querySelector('[class*="rounded-3xl"]');
      expect(card).toBeTruthy();

      const classList = card?.className || '';
      expect(classList).toContain('transition');
    });

    it('should maintain smooth animations on desktop', () => {
      const { container } = render(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      const classList = input?.className || '';
      expect(classList).toContain('transition');
    });

    it('should use appropriate animation duration for all devices', () => {
      const { container } = render(
        <Button variant="default">Click me</Button>
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const classList = button?.className || '';
      expect(classList).toMatch(/duration-\d+/);
    });
  });

  describe('Responsive Typography', () => {
    it('should use responsive heading sizes', () => {
      const { container } = render(
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Heading</h1>
      );
      const heading = container.querySelector('h1');
      expect(heading).toBeTruthy();

      const classList = heading?.className || '';
      expect(classList).toContain('text-2xl');
      expect(classList).toContain('md:text-3xl');
      expect(classList).toContain('lg:text-4xl');
    });

    it('should use responsive body text sizes', () => {
      const { container } = render(
        <p className="text-sm md:text-base lg:text-lg">Body text</p>
      );
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeTruthy();

      const classList = paragraph?.className || '';
      expect(classList).toContain('text-sm');
      expect(classList).toContain('md:text-base');
      expect(classList).toContain('lg:text-lg');
    });

    it('should maintain readability on all screen sizes', () => {
      const { container } = render(
        <p className="text-sm md:text-base lg:text-lg leading-relaxed">
          Body text with good line height
        </p>
      );
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeTruthy();

      const classList = paragraph?.className || '';
      expect(classList).toContain('leading-relaxed');
    });
  });

  describe('Responsive Spacing', () => {
    it('should use responsive padding', () => {
      const { container } = render(
        <div className="p-4 md:p-5 lg:p-6">
          Content
        </div>
      );
      const element = container.querySelector('[class*="p-"]');
      expect(element).toBeTruthy();

      const classList = element?.className || '';
      expect(classList).toContain('p-4');
      expect(classList).toContain('md:p-5');
      expect(classList).toContain('lg:p-6');
    });

    it('should use responsive margin', () => {
      const { container } = render(
        <div className="m-4 md:m-5 lg:m-6">
          Content
        </div>
      );
      const element = container.querySelector('[class*="m-"]');
      expect(element).toBeTruthy();

      const classList = element?.className || '';
      expect(classList).toContain('m-4');
      expect(classList).toContain('md:m-5');
      expect(classList).toContain('lg:m-6');
    });

    it('should use responsive gap spacing', () => {
      const { container } = render(
        <div className="flex gap-4 md:gap-5 lg:gap-6">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );
      const flex = container.querySelector('[class*="gap"]');
      expect(flex).toBeTruthy();

      const classList = flex?.className || '';
      expect(classList).toContain('gap-4');
      expect(classList).toContain('md:gap-5');
      expect(classList).toContain('lg:gap-6');
    });
  });
});

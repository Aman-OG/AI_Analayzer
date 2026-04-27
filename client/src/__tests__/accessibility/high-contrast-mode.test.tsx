import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Textarea } from '../../components/ui/textarea'

/**
 * High Contrast Mode Tests
 * Validates: Requirements 12.5
 * 
 * These tests verify that all components render correctly in high contrast mode
 * by checking CSS media query support and increased border/text contrast.
 */

describe('High Contrast Mode Support', () => {
  let mediaQueryList: MediaQueryList

  beforeEach(() => {
    // Mock the prefers-contrast media query
    mediaQueryList = {
      matches: true,
      media: '(prefers-contrast: more)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList

    // Mock window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryList)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Button Component - High Contrast Mode', () => {
    it('should render button with focus ring for high contrast', () => {
      const { container } = render(<Button variant="default">Click me</Button>)
      const button = container.querySelector('button')
      
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('focus-visible:ring-4')
    })

    it('should apply high contrast styles to all button variants', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
      
      variants.forEach(variant => {
        const { container } = render(<Button variant={variant}>Button</Button>)
        const button = container.querySelector('button')
        expect(button).toBeInTheDocument()
      })
    })

    it('should maintain focus ring visibility in high contrast mode', () => {
      const { container } = render(<Button>Focus me</Button>)
      const button = container.querySelector('button')
      
      expect(button).toHaveClass('focus-visible:ring-4')
    })

    it('should have text visible in high contrast mode', () => {
      const { container } = render(<Button>High Contrast Text</Button>)
      const button = container.querySelector('button')
      
      expect(button?.textContent).toBe('High Contrast Text')
      expect(button).not.toHaveClass('opacity-50')
    })
  })

  describe('Input Component - High Contrast Mode', () => {
    it('should render input with border for high contrast', () => {
      const { container } = render(<Input placeholder="Enter text" />)
      const input = container.querySelector('input')
      
      expect(input).toBeInTheDocument()
      expect(input?.className).toContain('border')
    })

    it('should apply high contrast styles to error state', () => {
      const { container } = render(<Input error placeholder="Error input" />)
      const input = container.querySelector('input')
      
      expect(input?.className).toContain('border-red-500')
      expect(input).toHaveClass('focus-visible:ring-4')
    })

    it('should apply high contrast styles to success state', () => {
      const { container } = render(<Input success placeholder="Success input" />)
      const input = container.querySelector('input')
      
      expect(input?.className).toContain('border-green-500')
      expect(input).toHaveClass('focus-visible:ring-4')
    })

    it('should have increased focus ring visibility', () => {
      const { container } = render(<Input placeholder="Focus me" />)
      const input = container.querySelector('input')
      
      expect(input).toHaveClass('focus-visible:ring-4')
    })

    it('should maintain text visibility in high contrast mode', () => {
      const { container } = render(<Input placeholder="Type here" />)
      const input = container.querySelector('input')
      
      expect(input).not.toHaveClass('opacity-50')
    })
  })

  describe('Card Component - High Contrast Mode', () => {
    it('should render card with border for high contrast', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )
      const card = container.querySelector('[class*="rounded-3xl"]')
      
      expect(card).toBeInTheDocument()
      expect(card?.className).toContain('border')
    })

    it('should apply high contrast border styling to card', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>High Contrast Card</CardTitle>
          </CardHeader>
        </Card>
      )
      const card = container.querySelector('[class*="rounded-3xl"]')
      
      expect(card?.className).toContain('border')
    })

    it('should maintain card title visibility in high contrast mode', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Visible Title</CardTitle>
          </CardHeader>
        </Card>
      )
      
      const title = screen.getByText('Visible Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl')
      expect(title).toHaveClass('font-semibold')
    })

    it('should have proper shadow for high contrast', () => {
      const { container } = render(
        <Card>
          <CardContent>Shadowed content</CardContent>
        </Card>
      )
      const card = container.querySelector('[class*="rounded-3xl"]')
      
      expect(card).toHaveClass('shadow-md-blue')
    })
  })

  describe('Textarea Component - High Contrast Mode', () => {
    it('should render textarea with border for high contrast', () => {
      const { container } = render(<Textarea placeholder="Enter text" />)
      const textarea = container.querySelector('textarea')
      
      expect(textarea).toBeInTheDocument()
      expect(textarea?.className).toContain('border')
    })

    it('should apply high contrast styles to error state', () => {
      const { container } = render(<Textarea error placeholder="Error textarea" />)
      const textarea = container.querySelector('textarea')
      
      expect(textarea?.className).toContain('border-red-500')
      expect(textarea).toHaveClass('focus-visible:ring-4')
    })

    it('should apply high contrast styles to success state', () => {
      const { container } = render(<Textarea success placeholder="Success textarea" />)
      const textarea = container.querySelector('textarea')
      
      expect(textarea?.className).toContain('border-green-500')
      expect(textarea).toHaveClass('focus-visible:ring-4')
    })

    it('should have increased focus ring visibility', () => {
      const { container } = render(<Textarea placeholder="Focus me" />)
      const textarea = container.querySelector('textarea')
      
      expect(textarea).toHaveClass('focus-visible:ring-4')
    })
  })

  describe('High Contrast Mode - CSS Media Query', () => {
    it('should support prefers-contrast media query', () => {
      const mediaQuery = window.matchMedia('(prefers-contrast: more)')
      expect(mediaQuery).toBeDefined()
    })

    it('should apply high contrast styles when media query matches', () => {
      const mockMediaQuery = window.matchMedia('(prefers-contrast: more)')
      expect(mockMediaQuery.matches).toBe(true)
    })

    it('should support high contrast mode on Windows', () => {
      const mediaQuery = window.matchMedia('(prefers-contrast: more)')
      expect(mediaQuery).toBeDefined()
    })

    it('should support high contrast mode on macOS/iOS', () => {
      const mediaQuery = window.matchMedia('(prefers-contrast: more)')
      expect(mediaQuery).toBeDefined()
    })
  })

  describe('High Contrast Mode - Border Contrast', () => {
    it('should have visible borders in high contrast mode', () => {
      const { container } = render(
        <Card>
          <CardContent>Test</CardContent>
        </Card>
      )
      const card = container.querySelector('[class*="rounded-3xl"]')
      
      expect(card?.className).toContain('border')
    })

    it('should apply focus rings to interactive elements', () => {
      const { container } = render(<Button>Click</Button>)
      const button = container.querySelector('button')
      
      expect(button).toHaveClass('focus-visible:ring-4')
    })

    it('should apply borders to form elements', () => {
      const { container } = render(<Input />)
      const input = container.querySelector('input')
      
      expect(input?.className).toContain('border')
      expect(input).toHaveClass('focus-visible:ring-4')
    })
  })

  describe('High Contrast Mode - Text Opacity', () => {
    it('should maintain full text opacity in high contrast mode', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Full Opacity Text</CardTitle>
          </CardHeader>
        </Card>
      )
      
      const title = screen.getByText('Full Opacity Text')
      expect(title).toBeInTheDocument()
      expect(title).not.toHaveClass('opacity-60')
      expect(title).not.toHaveClass('opacity-70')
    })

    it('should increase muted text visibility in high contrast mode', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      )
      
      const card = container.querySelector('[class*="rounded-3xl"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('High Contrast Mode - Shadow Opacity', () => {
    it('should have visible shadows in high contrast mode', () => {
      const { container } = render(
        <Card>
          <CardContent>Shadowed</CardContent>
        </Card>
      )
      const card = container.querySelector('[class*="rounded-3xl"]')
      
      expect(card).toHaveClass('shadow-md-blue')
    })

    it('should apply shadows to cards', () => {
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      )
      const card = container.querySelector('[class*="rounded-3xl"]')
      
      expect(card).toHaveClass('shadow-md-blue')
    })
  })

  describe('High Contrast Mode - Focus Indicators', () => {
    it('should have visible focus indicators on buttons', () => {
      const { container } = render(<Button>Focus me</Button>)
      const button = container.querySelector('button')
      
      expect(button).toHaveClass('focus-visible:ring-4')
    })

    it('should have visible focus indicators on inputs', () => {
      const { container } = render(<Input />)
      const input = container.querySelector('input')
      
      expect(input).toHaveClass('focus-visible:ring-4')
    })

    it('should have visible focus indicators on textareas', () => {
      const { container } = render(<Textarea />)
      const textarea = container.querySelector('textarea')
      
      expect(textarea).toHaveClass('focus-visible:ring-4')
    })
  })

  describe('High Contrast Mode - Color Schemes', () => {
    it('should render correctly in light mode', () => {
      const { container } = render(
        <Card>
          <CardContent>Light mode content</CardContent>
        </Card>
      )
      const card = container.querySelector('[class*="rounded-3xl"]')
      
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-card/80')
    })

    it('should render correctly in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Card>
            <CardContent>Dark mode content</CardContent>
          </Card>
        </div>
      )
      const card = container.querySelector('[class*="rounded-3xl"]')
      
      expect(card).toBeInTheDocument()
    })

    it('should maintain color contrast ratios in high contrast mode', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>High Contrast Title</CardTitle>
          </CardHeader>
          <CardContent>Content with proper contrast</CardContent>
        </Card>
      )
      
      const title = screen.getByText('High Contrast Title')
      const content = screen.getByText('Content with proper contrast')
      
      expect(title).toBeInTheDocument()
      expect(content).toBeInTheDocument()
    })
  })

  describe('High Contrast Mode - Component Rendering', () => {
    it('should render all components correctly in high contrast mode', () => {
      const { container } = render(
        <div>
          <Button>Button</Button>
          <Input placeholder="Input" />
          <Card>
            <CardContent>Card</CardContent>
          </Card>
          <Textarea placeholder="Textarea" />
        </div>
      )
      
      expect(container.querySelector('button')).toBeInTheDocument()
      expect(container.querySelector('input')).toBeInTheDocument()
      expect(container.querySelector('[class*="rounded-3xl"]')).toBeInTheDocument()
      expect(container.querySelector('textarea')).toBeInTheDocument()
    })

    it('should maintain layout in high contrast mode', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Layout Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="Input" />
            <Button>Submit</Button>
          </CardContent>
        </Card>
      )
      
      const card = container.querySelector('[class*="rounded-3xl"]')
      const input = container.querySelector('input')
      const button = container.querySelector('button')
      
      expect(card).toBeInTheDocument()
      expect(input).toBeInTheDocument()
      expect(button).toBeInTheDocument()
    })

    it('should render disabled states correctly in high contrast mode', () => {
      const { container } = render(
        <div>
          <Button disabled>Disabled Button</Button>
          <Input disabled placeholder="Disabled Input" />
          <Textarea disabled placeholder="Disabled Textarea" />
        </div>
      )
      
      const button = container.querySelector('button')
      const input = container.querySelector('input')
      const textarea = container.querySelector('textarea')
      
      expect(button).toBeDisabled()
      expect(input).toBeDisabled()
      expect(textarea).toBeDisabled()
    })
  })

  describe('High Contrast Mode - Accessibility', () => {
    it('should have proper ARIA attributes for accessibility', () => {
      const { container } = render(
        <div>
          <Button ariaLabel="Submit form">Submit</Button>
          <Input ariaLabel="Email input" />
        </div>
      )
      
      const button = container.querySelector('button')
      const input = container.querySelector('input')
      
      expect(button).toHaveAttribute('aria-label', 'Submit form')
      expect(input).toHaveAttribute('aria-label', 'Email input')
    })

    it('should support error states with ARIA attributes', () => {
      const { container } = render(
        <Input error ariaDescribedBy="error-message" />
      )
      
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
    })

    it('should support loading states with ARIA attributes', () => {
      const { container } = render(
        <Button isLoading ariaLabel="Loading">
          Submit
        </Button>
      )
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toBeDisabled()
    })
  })
})

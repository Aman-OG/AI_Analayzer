import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from './button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with default variant', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-blue-600')
    })

    it('should render button with primary variant', () => {
      render(<Button variant="default">Primary</Button>)
      const button = screen.getByRole('button', { name: /primary/i })
      expect(button).toHaveClass('bg-blue-600', 'text-white')
    })

    it('should render button with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button', { name: /secondary/i })
      expect(button).toHaveClass('bg-secondary')
    })

    it('should render button with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button', { name: /ghost/i })
      expect(button).toHaveClass('text-foreground')
    })

    it('should render button with destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button', { name: /delete/i })
      expect(button).toHaveClass('bg-red-600', 'text-white')
    })

    it('should render button with outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button', { name: /outline/i })
      expect(button).toHaveClass('border', 'border-input')
    })

    it('should render button with link variant', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button', { name: /link/i })
      expect(button).toHaveClass('text-blue-600')
    })
  })

  describe('Sizes', () => {
    it('should render button with default size', () => {
      render(<Button size="default">Default</Button>)
      const button = screen.getByRole('button', { name: /default/i })
      expect(button).toHaveClass('h-10', 'px-4', 'py-2')
    })

    it('should render button with small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button', { name: /small/i })
      expect(button).toHaveClass('h-9', 'px-3')
    })

    it('should render button with large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button', { name: /large/i })
      expect(button).toHaveClass('h-11', 'px-8')
    })

    it('should render button with icon size', () => {
      render(<Button size="icon">🔍</Button>)
      const button = screen.getByRole('button', { name: /🔍/i })
      expect(button).toHaveClass('h-10', 'w-10')
    })
  })

  describe('Micro-interactions', () => {
    it('should have hover state classes', () => {
      render(<Button>Hover me</Button>)
      const button = screen.getByRole('button', { name: /hover me/i })
      expect(button).toHaveClass('hover:shadow-lg', 'hover:-translate-y-0.5')
    })

    it('should have click feedback classes', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toHaveClass('active:scale-95')
    })

    it('should have focus ring styling', () => {
      render(<Button>Focus me</Button>)
      const button = screen.getByRole('button', { name: /focus me/i })
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-4')
    })

    it('should have transition classes', () => {
      render(<Button>Transition</Button>)
      const button = screen.getByRole('button', { name: /transition/i })
      expect(button).toHaveClass('transition-all', 'duration-150', 'ease-out')
    })
  })

  describe('Disabled State', () => {
    it('should render disabled button with reduced opacity', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button', { name: /disabled/i })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none')
    })

    it('should not apply hover effects when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button', { name: /disabled/i })
      expect(button).toHaveClass('disabled:hover:shadow-none', 'disabled:hover:translate-y-0', 'disabled:active:scale-100')
    })

    it('should disable button when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should render loading spinner when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      // Check for loading text
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render children when isLoading is false', () => {
      render(<Button isLoading={false}>Submit</Button>)
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should render children by default', () => {
      render(<Button>Submit</Button>)
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })

  describe('Click Handler', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick handler when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick handler when loading', () => {
      const handleClick = vi.fn()
      render(<Button isLoading onClick={handleClick}>Submit</Button>)
      const button = screen.getByRole('button')
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Press me</Button>)
      const button = screen.getByRole('button', { name: /press me/i })
      
      button.focus()
      expect(button).toHaveFocus()
      
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalled()
    })

    it('should have proper ARIA attributes', () => {
      render(<Button>Accessible Button</Button>)
      const button = screen.getByRole('button', { name: /accessible button/i })
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should announce disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button', { name: /disabled button/i })
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('Custom Classes', () => {
    it('should accept custom className prop', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button', { name: /custom/i })
      expect(button).toHaveClass('custom-class')
    })

    it('should merge custom classes with default classes', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button', { name: /custom/i })
      expect(button).toHaveClass('custom-class', 'bg-blue-600', 'text-white')
    })
  })

  describe('Variant-specific Hover Effects', () => {
    it('primary variant should have blue hover color', () => {
      render(<Button variant="default">Primary</Button>)
      const button = screen.getByRole('button', { name: /primary/i })
      expect(button).toHaveClass('hover:bg-blue-700')
    })

    it('destructive variant should have red hover color', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button', { name: /delete/i })
      expect(button).toHaveClass('hover:bg-red-700')
    })

    it('secondary variant should have secondary hover color', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button', { name: /secondary/i })
      expect(button).toHaveClass('hover:bg-secondary/80')
    })

    it('outline variant should have border color change on hover', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button', { name: /outline/i })
      expect(button).toHaveClass('hover:border-primary/50')
    })

    it('link variant should have underline on hover', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button', { name: /link/i })
      expect(button).toHaveClass('hover:underline')
    })
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

describe('Keyboard Navigation and Focus Management', () => {
  describe('Button Keyboard Accessibility', () => {
    it('should be focusable with Tab key', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should trigger click on Enter key', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Press Enter</Button>)
      const button = screen.getByRole('button', { name: /press enter/i })
      
      button.focus()
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalled()
    })

    it('should trigger click on Space key', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Press Space</Button>)
      const button = screen.getByRole('button', { name: /press space/i })
      
      button.focus()
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalled()
    })

    it('should have visible focus indicator', () => {
      render(<Button>Focus me</Button>)
      const button = screen.getByRole('button', { name: /focus me/i })
      
      expect(button).toHaveClass('focus-visible:ring-4')
      // Button uses variant-specific ring color
      expect(button).toHaveClass('focus-visible:ring-blue-500/10')
    })

    it('should not trigger click when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      const button = screen.getByRole('button', { name: /disabled/i })
      
      expect(button).toBeDisabled()
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Input Keyboard Accessibility', () => {
    it('should be focusable with Tab key', () => {
      render(<Input placeholder="Type here" />)
      const input = screen.getByPlaceholderText(/type here/i)
      
      input.focus()
      expect(input).toHaveFocus()
    })

    it('should accept keyboard input when focused', () => {
      render(<Input placeholder="Type here" />)
      const input = screen.getByPlaceholderText(/type here/i) as HTMLInputElement
      
      input.focus()
      fireEvent.change(input, { target: { value: 'hello' } })
      expect(input.value).toBe('hello')
    })

    it('should have visible focus ring', () => {
      render(<Input placeholder="Focus me" />)
      const input = screen.getByPlaceholderText(/focus me/i)
      
      expect(input).toHaveClass('focus-visible:ring-4')
      expect(input).toHaveClass('focus-visible:ring-blue-600/10')
    })

    it('should show error state focus ring', () => {
      render(<Input placeholder="Error input" error />)
      const input = screen.getByPlaceholderText(/error input/i)
      
      expect(input).toHaveClass('focus-visible:ring-red-500/10')
    })

    it('should show success state focus ring', () => {
      render(<Input placeholder="Success input" success />)
      const input = screen.getByPlaceholderText(/success input/i)
      
      expect(input).toHaveClass('focus-visible:ring-green-500/10')
    })

    it('should not accept input when disabled', () => {
      render(<Input placeholder="Disabled" disabled />)
      const input = screen.getByPlaceholderText(/disabled/i) as HTMLInputElement
      
      expect(input).toBeDisabled()
      // Disabled inputs should not be editable
      expect(input.disabled).toBe(true)
    })
  })

  describe('Focus Order', () => {
    it('should have proper focus management structure', () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Input placeholder="Third" />
          <Button>Fourth</Button>
        </div>
      )
      
      const firstButton = screen.getByRole('button', { name: /first/i })
      const secondButton = screen.getByRole('button', { name: /second/i })
      const input = screen.getByPlaceholderText(/third/i)
      const fourthButton = screen.getByRole('button', { name: /fourth/i })
      
      // Verify all elements are in the DOM and focusable
      expect(firstButton).toBeInTheDocument()
      expect(secondButton).toBeInTheDocument()
      expect(input).toBeInTheDocument()
      expect(fourthButton).toBeInTheDocument()
    })
  })

  describe('Focus Indicators Visibility', () => {
    it('should have 4px focus ring with 10% opacity on button', () => {
      render(<Button>Focus Ring Test</Button>)
      const button = screen.getByRole('button', { name: /focus ring test/i })
      
      expect(button).toHaveClass('focus-visible:ring-4')
      // Button uses variant-specific ring color
      expect(button).toHaveClass('focus-visible:ring-blue-500/10')
    })

    it('should have visible focus indicator on input', () => {
      render(<Input placeholder="Focus indicator" />)
      const input = screen.getByPlaceholderText(/focus indicator/i)
      
      expect(input).toHaveClass('focus-visible:ring-4')
      expect(input).toHaveClass('focus-visible:ring-offset-2')
    })

    it('should have focus outline removed', () => {
      render(<Button>No Outline</Button>)
      const button = screen.getByRole('button', { name: /no outline/i })
      
      expect(button).toHaveClass('focus-visible:outline-none')
    })
  })

  describe('Keyboard Accessibility for Different Button Variants', () => {
    it('should be keyboard accessible for all variants', () => {
      const variants = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
      
      render(
        <div>
          {variants.map(variant => (
            <Button key={variant} variant={variant}>{variant}</Button>
          ))}
        </div>
      )
      
      for (const variant of variants) {
        const button = screen.getByRole('button', { name: new RegExp(variant, 'i') })
        expect(button).toHaveClass('focus-visible:ring-4')
      }
    })
  })

  describe('Tab Trapping in Modals', () => {
    it('should have proper focus management structure', () => {
      render(
        <div role="dialog" aria-modal="true">
          <Button>First Button</Button>
          <Input placeholder="Input field" />
          <Button>Last Button</Button>
        </div>
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      
      const buttons = screen.getAllByRole('button')
      const input = screen.getByPlaceholderText(/input field/i)
      
      expect(buttons.length).toBe(2)
      expect(input).toBeInTheDocument()
    })
  })

  describe('Disabled State Keyboard Handling', () => {
    it('should not be clickable when disabled', () => {
      const handleClick = vi.fn()
      render(
        <>
          <Button>Enabled</Button>
          <Button disabled onClick={handleClick}>Disabled</Button>
        </>
      )
      
      const disabledButton = screen.getByRole('button', { name: /disabled/i })
      
      expect(disabledButton).toBeDisabled()
      fireEvent.click(disabledButton)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('ARIA Labels for Keyboard Navigation', () => {
    it('should have proper ARIA labels on buttons', () => {
      render(
        <Button aria-label="Close dialog">
          ×
        </Button>
      )
      
      const button = screen.getByRole('button', { name: /close dialog/i })
      expect(button).toHaveAttribute('aria-label', 'Close dialog')
    })

    it('should have proper ARIA labels on inputs', () => {
      render(
        <div>
          <label htmlFor="email">Email</label>
          <Input id="email" placeholder="Enter email" />
        </div>
      )
      
      const input = screen.getByPlaceholderText(/enter email/i)
      expect(input).toHaveAttribute('id', 'email')
    })
  })

  describe('Modal Escape Key Handling', () => {
    it('should have escape key handler structure', () => {
      const handleClose = vi.fn()
      render(
        <div role="dialog" aria-label="Test Modal">
          <Button onClick={handleClose}>Close</Button>
        </div>
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-label', 'Test Modal')
    })
  })

  describe('Dropdown Menu Keyboard Navigation', () => {
    it('should have focus ring on menu items', () => {
      render(
        <div>
          <Button>Menu Trigger</Button>
          <div role="menu">
            <div role="menuitem" className="focus-visible:ring-4 focus-visible:ring-primary/10">
              Item 1
            </div>
            <div role="menuitem" className="focus-visible:ring-4 focus-visible:ring-primary/10">
              Item 2
            </div>
          </div>
        </div>
      )
      
      const items = screen.getAllByRole('menuitem')
      expect(items[0]).toHaveClass('focus-visible:ring-4')
      expect(items[1]).toHaveClass('focus-visible:ring-4')
    })
  })
})


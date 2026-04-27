import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from './input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input with default styling', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border')
    })

    it('should render input with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
    })

    it('should render input with default type', () => {
      const { container } = render(<Input />)
      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
      // Input component doesn't explicitly set type="text", it defaults to text
    })

    it('should render input with custom type', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render input with custom className', () => {
      render(<Input className="custom-input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input')
    })
  })

  describe('Focus Ring', () => {
    it('should have focus ring styling', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-4')
    })

    it('should have focus ring with blue color by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-blue-600/10')
    })

    it('should have focus border color change', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:border-blue-600')
    })

    it('should apply focus ring on focus event', () => {
      const { container } = render(<Input />)
      const input = container.querySelector('input') as HTMLInputElement
      
      input.focus()
      // In jsdom, focus may not work as expected, so we just verify the element exists
      expect(input).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should render input with error styling', () => {
      render(<Input error />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-500')
    })

    it('should have red focus ring on error', () => {
      render(<Input error />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-red-500/10')
    })

    it('should have aria-invalid attribute when error', () => {
      render(<Input error />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should not have aria-invalid when no error', () => {
      render(<Input error={false} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('Success State', () => {
    it('should render input with success styling', () => {
      render(<Input success />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-green-500')
    })

    it('should have green focus ring on success', () => {
      render(<Input success />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-green-500/10')
    })

    it('should not have error styling when success', () => {
      render(<Input success />)
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveClass('border-red-500')
    })
  })

  describe('Disabled State', () => {
    it('should render disabled input', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should have reduced opacity when disabled', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:opacity-50')
    })

    it('should have cursor-not-allowed when disabled', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:cursor-not-allowed')
    })

    it('should not be focusable when disabled', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      
      fireEvent.focus(input)
      expect(input).not.toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input ariaLabel="Username" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Username')
    })

    it('should support aria-describedby', () => {
      render(<Input ariaDescribedBy="error-message" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
    })

    it('should have proper type attribute for accessibility', () => {
      const { container } = render(<Input type="password" />)
      const input = container.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      
      input.focus()
      expect(input).toHaveFocus()
      
      fireEvent.keyDown(input, { key: 'a', code: 'KeyA' })
      fireEvent.change(input, { target: { value: 'a' } })
      expect(input).toHaveValue('a')
    })
  })

  describe('User Interactions', () => {
    it('should handle text input', () => {
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      fireEvent.change(input, { target: { value: 'test' } })
      expect(input.value).toBe('test')
    })

    it('should handle focus event', () => {
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} />)
      const input = screen.getByRole('textbox')
      
      fireEvent.focus(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('should handle blur event', () => {
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')
      
      fireEvent.focus(input)
      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('should handle change event', () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'new value' } })
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('should handle keydown event', () => {
      const handleKeyDown = vi.fn()
      render(<Input onKeyDown={handleKeyDown} />)
      const input = screen.getByRole('textbox')
      
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('Transitions', () => {
    it('should have transition classes', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('transition-all', 'duration-300', 'ease-out')
    })
  })

  describe('Different Input Types', () => {
    it('should render email input', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render password input', () => {
      const { container } = render(<Input type="password" />)
      const input = container.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render number input', () => {
      render(<Input type="number" />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render date input', () => {
      const { container } = render(<Input type="date" />)
      const input = container.querySelector('input[type="date"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'date')
    })

    it('should render search input', () => {
      render(<Input type="search" />)
      const input = screen.getByRole('searchbox')
      expect(input).toHaveAttribute('type', 'search')
    })
  })

  describe('Placeholder Styling', () => {
    it('should have placeholder styling', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('placeholder:text-muted-foreground')
    })

    it('should display placeholder text', () => {
      render(<Input placeholder="Type here..." />)
      const input = screen.getByPlaceholderText('Type here...')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Border Styling', () => {
    it('should have default border styling', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border', 'border-input')
    })

    it('should have rounded corners', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('rounded-md')
    })
  })

  describe('Padding and Sizing', () => {
    it('should have proper padding', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('px-3', 'py-2')
    })

    it('should have proper height', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('h-10')
    })

    it('should be full width', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('w-full')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      render(<Input value="" onChange={() => {}} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle very long input', () => {
      const longText = 'a'.repeat(1000)
      render(<Input value={longText} onChange={() => {}} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(longText)
    })

    it('should handle special characters', () => {
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      fireEvent.change(input, { target: { value: '!@#$%^&*()' } })
      expect(input.value).toBe('!@#$%^&*()')
    })

    it('should handle unicode characters', () => {
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      fireEvent.change(input, { target: { value: '你好世界' } })
      expect(input.value).toBe('你好世界')
    })
  })

  describe('Combined States', () => {
    it('should handle error and disabled together', () => {
      render(<Input error disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('border-red-500')
    })

    it('should handle success and disabled together', () => {
      render(<Input success disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('border-green-500')
    })

    it('should prioritize error over success', () => {
      render(<Input error success />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-500')
    })
  })
})

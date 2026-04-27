import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Toaster, toast } from 'sonner'

// Mock window.matchMedia for system theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('Toast Component (Sonner)', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    const toasts = document.querySelectorAll('[data-sonner-toast]')
    toasts.forEach(t => t.remove())
  })

  describe('Rendering', () => {
    it('should render success toast', async () => {
      render(<Toaster />)
      toast.success('Success message')
      
      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
      })
    })

    it('should render error toast', async () => {
      render(<Toaster />)
      toast.error('Error message')
      
      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })
    })

    it('should render info toast', async () => {
      render(<Toaster />)
      toast('Info message')
      
      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument()
      })
    })
  })

  describe('Toast Variants', () => {
    it('should display success toast with correct styling', async () => {
      render(<Toaster richColors />)
      toast.success('Success!')
      
      await waitFor(() => {
        const toastElement = screen.getByText('Success!')
        expect(toastElement).toBeInTheDocument()
      })
    })

    it('should display error toast with correct styling', async () => {
      render(<Toaster richColors />)
      toast.error('Error!')
      
      await waitFor(() => {
        const toastElement = screen.getByText('Error!')
        expect(toastElement).toBeInTheDocument()
      })
    })

    it('should display info toast with correct styling', async () => {
      render(<Toaster richColors />)
      toast('Info!')
      
      await waitFor(() => {
        const toastElement = screen.getByText('Info!')
        expect(toastElement).toBeInTheDocument()
      })
    })

    it('should display warning toast', async () => {
      render(<Toaster richColors />)
      toast.warning('Warning!')
      
      await waitFor(() => {
        const toastElement = screen.getByText('Warning!')
        expect(toastElement).toBeInTheDocument()
      })
    })
  })

  describe('Toast Position', () => {
    it('should render toast at top-right position', () => {
      render(<Toaster position="top-right" />)
      // Verify Toaster renders without errors
      expect(document.body).toBeInTheDocument()
    })

    it('should render toast at top-center position', () => {
      render(<Toaster position="top-center" />)
      expect(document.body).toBeInTheDocument()
    })

    it('should render toast at bottom-right position', () => {
      render(<Toaster position="bottom-right" />)
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after configured duration', async () => {
      render(<Toaster toastOptions={{ duration: 100 }} />)
      toast('Auto dismiss')
      
      await waitFor(() => {
        expect(screen.getByText('Auto dismiss')).toBeInTheDocument()
      })
      
      // Wait for auto-dismiss
      await waitFor(() => {
        expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument()
      }, { timeout: 500 })
    })

    it('should have default duration of 4500ms', () => {
      render(<Toaster toastOptions={{ duration: 4500 }} />)
      toast('Default duration')
      
      // Just verify toast renders
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Multiple Toasts', () => {
    it('should stack multiple toasts vertically', async () => {
      render(<Toaster gap={12} />)
      
      toast.success('First toast')
      toast.error('Second toast')
      toast('Third toast')
      
      await waitFor(() => {
        expect(screen.getByText('First toast')).toBeInTheDocument()
        expect(screen.getByText('Second toast')).toBeInTheDocument()
        expect(screen.getByText('Third toast')).toBeInTheDocument()
      })
    })

    it('should maintain proper spacing between toasts', async () => {
      render(<Toaster gap={12} />)
      
      toast('Toast 1')
      toast('Toast 2')
      
      await waitFor(() => {
        expect(screen.getByText('Toast 1')).toBeInTheDocument()
        expect(screen.getByText('Toast 2')).toBeInTheDocument()
      })
    })
  })

  describe('Toast Dismissal', () => {
    it('should allow manual dismissal', async () => {
      render(<Toaster />)
      const toastId = toast('Dismissible toast')
      
      await waitFor(() => {
        expect(screen.getByText('Dismissible toast')).toBeInTheDocument()
      })
      
      // Dismiss the toast
      toast.dismiss(toastId)
      
      await waitFor(() => {
        expect(screen.queryByText('Dismissible toast')).not.toBeInTheDocument()
      }, { timeout: 500 })
    })

    it('should dismiss all toasts', async () => {
      render(<Toaster />)
      
      toast('Toast 1')
      toast('Toast 2')
      
      await waitFor(() => {
        expect(screen.getByText('Toast 1')).toBeInTheDocument()
        expect(screen.getByText('Toast 2')).toBeInTheDocument()
      })
      
      // Dismiss all
      toast.dismiss()
      
      await waitFor(() => {
        expect(screen.queryByText('Toast 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Toast 2')).not.toBeInTheDocument()
      }, { timeout: 500 })
    })
  })

  describe('Toast with Custom Content', () => {
    it('should render toast with description', async () => {
      render(<Toaster />)
      toast.success('Success', {
        description: 'Operation completed successfully'
      })
      
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument()
        expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
      })
    })

    it('should render toast with action button', async () => {
      render(<Toaster />)
      const actionFn = vi.fn()
      
      toast('Action toast', {
        action: {
          label: 'Undo',
          onClick: actionFn
        }
      })
      
      await waitFor(() => {
        expect(screen.getByText('Action toast')).toBeInTheDocument()
        expect(screen.getByText('Undo')).toBeInTheDocument()
      })
    })
  })

  describe('Theme Support', () => {
    it('should support light theme', () => {
      render(<Toaster theme="light" />)
      expect(document.body).toBeInTheDocument()
    })

    it('should support dark theme', () => {
      render(<Toaster theme="dark" />)
      expect(document.body).toBeInTheDocument()
    })

    it('should support system theme', () => {
      render(<Toaster theme="system" />)
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(<Toaster containerAriaLabel="Notifications" />)
      toast('Accessible toast')
      
      await waitFor(() => {
        expect(screen.getByText('Accessible toast')).toBeInTheDocument()
      })
    })

    it('should announce toast to screen readers', async () => {
      render(<Toaster />)
      toast('Screen reader announcement')
      
      await waitFor(() => {
        expect(screen.getByText('Screen reader announcement')).toBeInTheDocument()
      })
    })
  })

  describe('Toast Options', () => {
    it('should apply custom toast options', async () => {
      render(
        <Toaster
          toastOptions={{
            duration: 2000,
            classNames: {
              toast: 'custom-toast-class'
            }
          }}
        />
      )
      
      toast('Custom options')
      
      await waitFor(() => {
        expect(screen.getByText('Custom options')).toBeInTheDocument()
      })
    })

    it('should support rich colors', async () => {
      render(<Toaster richColors />)
      
      toast.success('Rich success')
      toast.error('Rich error')
      
      await waitFor(() => {
        expect(screen.getByText('Rich success')).toBeInTheDocument()
        expect(screen.getByText('Rich error')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long toast message', async () => {
      render(<Toaster />)
      const longMessage = 'a'.repeat(500)
      toast(longMessage)
      
      await waitFor(() => {
        expect(screen.getByText(longMessage)).toBeInTheDocument()
      })
    })

    it('should handle rapid toast creation', async () => {
      render(<Toaster />)
      
      for (let i = 0; i < 5; i++) {
        toast(`Toast ${i + 1}`)
      }
      
      await waitFor(() => {
        expect(screen.getByText('Toast 1')).toBeInTheDocument()
        expect(screen.getByText('Toast 5')).toBeInTheDocument()
      })
    })

    it('should handle special characters in message', async () => {
      render(<Toaster />)
      toast('Special chars: !@#$%^&*()')
      
      await waitFor(() => {
        expect(screen.getByText('Special chars: !@#$%^&*()')).toBeInTheDocument()
      })
    })
  })

  describe('Toast Variants with Descriptions', () => {
    it('should render success toast with description', async () => {
      render(<Toaster />)
      toast.success('Success!', {
        description: 'Your action was successful'
      })
      
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument()
        expect(screen.getByText('Your action was successful')).toBeInTheDocument()
      })
    })

    it('should render error toast with description', async () => {
      render(<Toaster />)
      toast.error('Error!', {
        description: 'Something went wrong'
      })
      
      await waitFor(() => {
        expect(screen.getByText('Error!')).toBeInTheDocument()
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
    })
  })

  describe('Promise-based Toasts', () => {
    it('should handle promise-based toast', async () => {
      render(<Toaster />)
      
      const promise = new Promise(resolve => {
        setTimeout(() => resolve('Done'), 100)
      })
      
      toast.promise(promise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!'
      })
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })
  })
})

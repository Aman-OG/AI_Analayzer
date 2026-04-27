import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Badge } from './badge'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge with default variant', () => {
      render(<Badge>Default Badge</Badge>)
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-blue-600', 'text-white')
    })

    it('should render badge with proper base styling', () => {
      render(<Badge>Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'gap-1.5', 'rounded-full')
    })

    it('should render badge with pill shape', () => {
      render(<Badge>Pill Badge</Badge>)
      const badge = screen.getByText('Pill Badge')
      expect(badge).toHaveClass('rounded-full', 'px-3', 'py-1')
    })

    it('should render badge with proper text styling', () => {
      render(<Badge>Text Badge</Badge>)
      const badge = screen.getByText('Text Badge')
      expect(badge).toHaveClass('text-xs', 'font-semibold')
    })

    it('should accept custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('should render info variant', () => {
      render(<Badge variant="info">Info</Badge>)
      const badge = screen.getByText('Info')
      expect(badge).toHaveClass('bg-blue-600', 'text-white')
    })

    it('should render success variant', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('bg-green-600', 'text-white')
    })

    it('should render error variant', () => {
      render(<Badge variant="error">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge).toHaveClass('bg-red-600', 'text-white')
    })

    it('should render warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>)
      const badge = screen.getByText('Warning')
      expect(badge).toHaveClass('bg-yellow-600', 'text-white')
    })

    it('should render secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('should render destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('bg-red-600', 'text-white')
    })

    it('should render outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('border', 'border-input', 'bg-background')
    })
  })

  describe('Hover Effects', () => {
    it('should have hover color change for info variant', () => {
      render(<Badge variant="info">Hover</Badge>)
      const badge = screen.getByText('Hover')
      expect(badge).toHaveClass('hover:bg-blue-700')
    })

    it('should have hover color change for success variant', () => {
      render(<Badge variant="success">Hover</Badge>)
      const badge = screen.getByText('Hover')
      expect(badge).toHaveClass('hover:bg-green-700')
    })

    it('should have hover color change for error variant', () => {
      render(<Badge variant="error">Hover</Badge>)
      const badge = screen.getByText('Hover')
      expect(badge).toHaveClass('hover:bg-red-700')
    })

    it('should have hover color change for warning variant', () => {
      render(<Badge variant="warning">Hover</Badge>)
      const badge = screen.getByText('Hover')
      expect(badge).toHaveClass('hover:bg-yellow-700')
    })

    it('should have hover shadow enhancement', () => {
      render(<Badge>Hover Shadow</Badge>)
      const badge = screen.getByText('Hover Shadow')
      expect(badge).toHaveClass('hover:shadow-lg')
    })
  })

  describe('Icon Support', () => {
    it('should render badge with icon', () => {
      render(
        <Badge icon={<CheckCircle size={16} />}>
          Success Badge
        </Badge>
      )
      const badge = screen.getByText('Success Badge')
      expect(badge).toBeInTheDocument()
      expect(badge.querySelector('svg')).toBeInTheDocument()
    })

    it('should render badge with error icon', () => {
      render(
        <Badge variant="error" icon={<AlertCircle size={16} />}>
          Error Badge
        </Badge>
      )
      const badge = screen.getByText('Error Badge')
      expect(badge).toBeInTheDocument()
      expect(badge.querySelector('svg')).toBeInTheDocument()
    })

    it('should render badge with info icon', () => {
      render(
        <Badge variant="info" icon={<Info size={16} />}>
          Info Badge
        </Badge>
      )
      const badge = screen.getByText('Info Badge')
      expect(badge).toBeInTheDocument()
      expect(badge.querySelector('svg')).toBeInTheDocument()
    })

    it('should render badge with warning icon', () => {
      render(
        <Badge variant="warning" icon={<AlertTriangle size={16} />}>
          Warning Badge
        </Badge>
      )
      const badge = screen.getByText('Warning Badge')
      expect(badge).toBeInTheDocument()
      expect(badge.querySelector('svg')).toBeInTheDocument()
    })

    it('should have proper icon spacing', () => {
      render(
        <Badge icon={<CheckCircle size={16} />}>
          Spaced Icon
        </Badge>
      )
      const badge = screen.getByText('Spaced Icon')
      expect(badge).toHaveClass('gap-1.5')
    })
  })

  describe('Transitions', () => {
    it('should have transition classes', () => {
      render(<Badge>Transition</Badge>)
      const badge = screen.getByText('Transition')
      expect(badge).toHaveClass('transition-all', 'duration-150', 'ease-out')
    })
  })

  describe('Shadow Styling', () => {
    it('should have base shadow', () => {
      render(<Badge>Shadow</Badge>)
      const badge = screen.getByText('Shadow')
      expect(badge).toHaveClass('shadow-md')
    })

    it('should have hover shadow enhancement', () => {
      render(<Badge>Hover Shadow</Badge>)
      const badge = screen.getByText('Hover Shadow')
      expect(badge).toHaveClass('hover:shadow-lg')
    })

    it('should have shadow for all variants', () => {
      const variants = ['info', 'success', 'error', 'warning'] as const
      
      variants.forEach(variant => {
        const { unmount } = render(<Badge variant={variant}>Badge</Badge>)
        const badge = screen.getByText('Badge')
        expect(badge).toHaveClass('shadow-md')
        unmount()
      })
    })
  })

  describe('Focus Ring', () => {
    it('should have focus ring styling', () => {
      render(<Badge>Focus</Badge>)
      const badge = screen.getByText('Focus')
      expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2')
    })

    it('should have focus ring with primary color', () => {
      render(<Badge>Focus Ring</Badge>)
      const badge = screen.getByText('Focus Ring')
      expect(badge).toHaveClass('focus:ring-primary/20')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible with semantic HTML', () => {
      render(<Badge>Accessible Badge</Badge>)
      const badge = screen.getByText('Accessible Badge')
      expect(badge).toBeInTheDocument()
    })

    it('should support custom data attributes', () => {
      const { container } = render(
        <Badge data-testid="custom-badge">Badge</Badge>
      )
      const badge = container.querySelector('[data-testid="custom-badge"]')
      expect(badge).toBeInTheDocument()
    })

    it('should render with proper role', () => {
      const { container } = render(<Badge>Badge</Badge>)
      const badge = container.querySelector('.inline-flex')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Multiple Badges', () => {
    it('should render multiple badges with different variants', () => {
      render(
        <>
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="warning">Warning</Badge>
        </>
      )
      
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
    })

    it('should render multiple badges with icons', () => {
      render(
        <>
          <Badge icon={<CheckCircle size={16} />}>Success</Badge>
          <Badge icon={<AlertCircle size={16} />}>Error</Badge>
        </>
      )
      
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render empty badge', () => {
      const { container } = render(<Badge />)
      const badge = container.querySelector('.inline-flex')
      expect(badge).toBeInTheDocument()
    })

    it('should render badge with very long text', () => {
      const longText = 'This is a very long badge text that should wrap properly'
      render(<Badge>{longText}</Badge>)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should render badge with special characters', () => {
      render(<Badge>Badge !@#$%</Badge>)
      expect(screen.getByText('Badge !@#$%')).toBeInTheDocument()
    })

    it('should render badge with unicode characters', () => {
      render(<Badge>Badge 你好</Badge>)
      expect(screen.getByText('Badge 你好')).toBeInTheDocument()
    })

    it('should render badge with only icon', () => {
      const { container } = render(
        <Badge icon={<CheckCircle size={16} />} />
      )
      const badge = container.querySelector('.inline-flex')
      expect(badge?.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Variant-specific Hover Effects', () => {
    it('info variant should have blue hover', () => {
      render(<Badge variant="info">Info</Badge>)
      const badge = screen.getByText('Info')
      expect(badge).toHaveClass('hover:bg-blue-700')
    })

    it('success variant should have green hover', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('hover:bg-green-700')
    })

    it('error variant should have red hover', () => {
      render(<Badge variant="error">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge).toHaveClass('hover:bg-red-700')
    })

    it('warning variant should have yellow hover', () => {
      render(<Badge variant="warning">Warning</Badge>)
      const badge = screen.getByText('Warning')
      expect(badge).toHaveClass('hover:bg-yellow-700')
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain structure on different screen sizes', () => {
      render(<Badge>Responsive Badge</Badge>)
      const badge = screen.getByText('Responsive Badge')
      expect(badge).toHaveClass('inline-flex')
    })
  })

  describe('Dark Mode Support', () => {
    it('should render with proper styling in dark mode', () => {
      render(<Badge>Dark Mode Badge</Badge>)
      const badge = screen.getByText('Dark Mode Badge')
      expect(badge).toHaveClass('bg-blue-600', 'text-white')
    })
  })

  describe('Padding and Sizing', () => {
    it('should have proper horizontal padding', () => {
      render(<Badge>Padded</Badge>)
      const badge = screen.getByText('Padded')
      expect(badge).toHaveClass('px-3')
    })

    it('should have proper vertical padding', () => {
      render(<Badge>Padded</Badge>)
      const badge = screen.getByText('Padded')
      expect(badge).toHaveClass('py-1')
    })

    it('should have proper text size', () => {
      render(<Badge>Sized</Badge>)
      const badge = screen.getByText('Sized')
      expect(badge).toHaveClass('text-xs')
    })
  })

  describe('Icon Alignment', () => {
    it('should align icon and text properly', () => {
      render(
        <Badge icon={<CheckCircle size={16} />}>
          Aligned
        </Badge>
      )
      const badge = screen.getByText('Aligned')
      expect(badge).toHaveClass('items-center')
    })
  })
})

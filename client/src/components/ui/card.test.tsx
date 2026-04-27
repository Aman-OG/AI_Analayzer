import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render card with default styling', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content').closest('div')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-3xl', 'border', 'bg-card/80', 'backdrop-blur-md')
    })

    it('should render card with glassmorphism effect', () => {
      render(<Card>Glassmorphic card</Card>)
      const card = screen.getByText('Glassmorphic card').closest('div')
      expect(card).toHaveClass('backdrop-blur-md', 'bg-card/80')
    })

    it('should render card with shadow styling', () => {
      render(<Card>Shadowed card</Card>)
      const card = screen.getByText('Shadowed card').closest('div')
      expect(card).toHaveClass('shadow-md-blue')
    })

    it('should render card with border styling', () => {
      render(<Card>Bordered card</Card>)
      const card = screen.getByText('Bordered card').closest('div')
      expect(card).toHaveClass('border', 'border-white/30')
    })

    it('should accept custom className', () => {
      render(<Card className="custom-class">Custom card</Card>)
      const card = screen.getByText('Custom card').closest('div')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Hover Effects', () => {
    it('should have hover border color change', () => {
      render(<Card>Hover card</Card>)
      const card = screen.getByText('Hover card').closest('div')
      expect(card).toHaveClass('hover:border-blue-500/50')
    })

    it('should have hover shadow elevation', () => {
      render(<Card>Hover shadow</Card>)
      const card = screen.getByText('Hover shadow').closest('div')
      expect(card).toHaveClass('hover:shadow-2xl-blue')
    })

    it('should have smooth transition', () => {
      render(<Card>Transition card</Card>)
      const card = screen.getByText('Transition card').closest('div')
      expect(card).toHaveClass('transition-all')
    })
  })

  describe('CardHeader Component', () => {
    it('should render card header with proper spacing', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      )
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('should accept custom className in header', () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>
      )
      const header = screen.getByText('Header')
      expect(header).toHaveClass('custom-header', 'p-6')
    })
  })

  describe('CardTitle Component', () => {
    it('should render card title with proper styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      )
      const title = screen.getByText('Card Title')
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('should render as h3 element', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      )
      const title = screen.getByText('Title')
      expect(title.tagName).toBe('H3')
    })

    it('should accept custom className in title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title">Title</CardTitle>
          </CardHeader>
        </Card>
      )
      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription Component', () => {
    it('should render card description with proper styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
        </Card>
      )
      const description = screen.getByText('Card description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('should render as p element', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      const description = screen.getByText('Description')
      expect(description.tagName).toBe('P')
    })

    it('should accept custom className in description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription className="custom-desc">Desc</CardDescription>
          </CardHeader>
        </Card>
      )
      const description = screen.getByText('Desc')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('CardContent Component', () => {
    it('should render card content with proper padding', () => {
      render(
        <Card>
          <CardContent>Content here</CardContent>
        </Card>
      )
      const content = screen.getByText('Content here')
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('should accept custom className in content', () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>
      )
      const content = screen.getByText('Content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter Component', () => {
    it('should render card footer with proper styling', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('should accept custom className in footer', () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      )
      const footer = screen.getByText('Footer')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Complete Card Structure', () => {
    it('should render complete card with all subcomponents', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card</CardDescription>
          </CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer action</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('This is a complete card')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer action')).toBeInTheDocument()
    })

    it('should maintain proper structure and hierarchy', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )
      
      const card = container.querySelector('.rounded-3xl')
      expect(card).toBeInTheDocument()
      expect(card?.querySelector('h3')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be accessible with semantic HTML', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )
      
      const title = screen.getByText('Accessible Card')
      expect(title.tagName).toBe('H3')
    })

    it('should support custom data attributes', () => {
      const { container } = render(
        <Card data-testid="custom-card">Card</Card>
      )
      
      const card = container.querySelector('[data-testid="custom-card"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Dark Mode Support', () => {
    it('should render with dark mode classes', () => {
      render(<Card>Dark mode card</Card>)
      const card = screen.getByText('Dark mode card').closest('div')
      expect(card).toHaveClass('bg-card/80', 'backdrop-blur-md')
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain structure on different screen sizes', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Responsive Card</CardTitle>
          </CardHeader>
          <CardContent>Responsive content</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Responsive Card')).toBeInTheDocument()
      expect(screen.getByText('Responsive content')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render empty card', () => {
      const { container } = render(<Card />)
      const card = container.querySelector('.rounded-3xl')
      expect(card).toBeInTheDocument()
    })

    it('should render card with multiple children', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Multi-child Card</CardTitle>
          </CardHeader>
          <CardContent>Content 1</CardContent>
          <CardContent>Content 2</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Multi-child Card')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should handle long text content', () => {
      const longText = 'This is a very long text that should wrap properly within the card component without breaking the layout or causing any visual issues.'
      render(
        <Card>
          <CardContent>{longText}</CardContent>
        </Card>
      )
      
      expect(screen.getByText(longText)).toBeInTheDocument()
    })
  })
})

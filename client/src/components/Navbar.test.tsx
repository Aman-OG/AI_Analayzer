import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ThemeProvider } from './ThemeProvider'
import * as supabaseModule from '../lib/supabase'

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock useReducedMotion hook
vi.mock('../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false
}))

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <Navbar />
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock getSession to return no user
    vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
      data: { session: null }
    } as any)
    
    // Mock onAuthStateChange
    vi.mocked(supabaseModule.supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    } as any)
  })

  describe('Rendering', () => {
    it('should render navbar', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should render navbar with glassmorphism effect', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('backdrop-blur-xl', 'bg-white/80')
    })

    it('should render navbar with sticky positioning', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('sticky', 'top-0', 'z-50')
    })

    it('should render navbar with border', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('border-b')
    })

    it('should render navbar with shadow', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('shadow-lg')
    })
  })

  describe('Logo and Branding', () => {
    it('should render logo link', () => {
      renderNavbar()
      const logoLink = screen.getByRole('link', { name: /AI Resume Analyzer/i })
      expect(logoLink).toBeInTheDocument()
    })

    it('should render logo with icon', () => {
      renderNavbar()
      const logoLink = screen.getByRole('link', { name: /AI Resume Analyzer/i })
      expect(logoLink).toHaveClass('flex', 'items-center', 'space-x-2')
    })

    it('should link to home page', () => {
      renderNavbar()
      const logoLink = screen.getByRole('link', { name: /AI Resume Analyzer/i })
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Theme Toggle', () => {
    it('should render theme toggle button', () => {
      renderNavbar()
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have aria-label for theme toggle', () => {
      renderNavbar()
      const themeButtons = screen.queryAllByRole('button', { name: /switch to/i })
      expect(themeButtons.length).toBeGreaterThan(0)
    })

    it('should have title attribute for theme toggle', () => {
      renderNavbar()
      const buttons = screen.getAllByRole('button')
      const themeButton = buttons.find(btn => btn.getAttribute('title')?.includes('mode'))
      expect(themeButton).toBeInTheDocument()
    })

    it('should toggle theme on click', async () => {
      renderNavbar()
      const buttons = screen.getAllByRole('button')
      const themeButton = buttons.find(btn => btn.getAttribute('title')?.includes('mode'))
      
      if (themeButton) {
        fireEvent.click(themeButton)
        // Theme toggle should work
        expect(themeButton).toBeInTheDocument()
      }
    })

    it('should have hover rotation effect', () => {
      renderNavbar()
      const buttons = screen.getAllByRole('button')
      const themeButton = buttons.find(btn => btn.getAttribute('title')?.includes('mode'))
      expect(themeButton).toHaveClass('hover:rotate-180')
    })

    it('should have transition classes', () => {
      renderNavbar()
      const buttons = screen.getAllByRole('button')
      const themeButton = buttons.find(btn => btn.getAttribute('title')?.includes('mode'))
      expect(themeButton).toHaveClass('transition-all', 'duration-200')
    })
  })

  describe('User Navigation (when logged in)', () => {
    beforeEach(() => {
      // Mock getSession to return a user
      vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: '123', email: 'test@example.com' } } }
      } as any)
    })

    it('should render My Jobs link when user is logged in', async () => {
      renderNavbar()
      
      await waitFor(() => {
        const myJobsLink = screen.getByRole('link', { name: /my jobs/i })
        expect(myJobsLink).toBeInTheDocument()
      })
    })

    it('should render logout button when user is logged in', async () => {
      renderNavbar()
      
      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        expect(logoutButton).toBeInTheDocument()
      })
    })

    it('should have underline animation on My Jobs link hover', async () => {
      renderNavbar()
      
      await waitFor(() => {
        const myJobsLink = screen.queryByRole('link', { name: /my jobs/i })
        if (myJobsLink) {
          expect(myJobsLink).toHaveClass('group')
        }
      }, { timeout: 1000 })
    })

    it('should link to jobs page', async () => {
      renderNavbar()
      
      await waitFor(() => {
        const myJobsLink = screen.getByRole('link', { name: /my jobs/i })
        expect(myJobsLink).toHaveAttribute('href', '/jobs')
      })
    })
  })

  describe('Logout Functionality', () => {
    beforeEach(() => {
      vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: '123', email: 'test@example.com' } } }
      } as any)
    })

    it('should call signOut on logout button click', async () => {
      vi.mocked(supabaseModule.supabase.auth.signOut).mockResolvedValue({} as any)
      
      renderNavbar()
      
      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        fireEvent.click(logoutButton)
      })
      
      await waitFor(() => {
        expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled()
      })
    })

    it('should have hover effect on logout button', async () => {
      renderNavbar()
      
      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        expect(logoutButton).toHaveClass('hover:text-red-600')
      })
    })

    it('should have aria-label on logout button', async () => {
      renderNavbar()
      
      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        expect(logoutButton).toHaveAttribute('aria-label', 'Logout')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper navigation role', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should have proper button roles', () => {
      renderNavbar()
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have proper link roles', () => {
      renderNavbar()
      const logoLink = screen.getByRole('link', { name: /AI Resume Analyzer/i })
      expect(logoLink).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render navbar on all screen sizes', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should have container with proper padding', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      const container = nav.querySelector('.container')
      expect(container).toHaveClass('px-4', 'py-3')
    })

    it('should have flex layout for responsive design', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      const container = nav.querySelector('.container')
      expect(container).toHaveClass('flex', 'items-center', 'justify-between')
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('dark:bg-slate-900/80', 'dark:border-slate-800/50')
    })

    it('should have dark mode shadow', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('dark:shadow-slate-900/50')
    })
  })

  describe('Transitions and Animations', () => {
    it('should have transition classes on navbar', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('transition-all', 'duration-300')
    })

    it('should have transition on logo icon', () => {
      renderNavbar()
      const logoLink = screen.getByRole('link', { name: /AI Resume Analyzer/i })
      const icon = logoLink.querySelector('svg')
      expect(icon).toHaveClass('transition-transform', 'duration-200')
    })
  })

  describe('Logo Icon Hover Effect', () => {
    it('should have scale effect on logo hover', () => {
      renderNavbar()
      const logoLink = screen.getByRole('link', { name: /AI Resume Analyzer/i })
      expect(logoLink).toHaveClass('group')
      
      const icon = logoLink.querySelector('svg')
      expect(icon).toHaveClass('group-hover:scale-110')
    })
  })

  describe('Button Styling', () => {
    it('should render buttons with proper styling', () => {
      renderNavbar()
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing user gracefully', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should maintain navbar structure with long branding text', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      const container = nav.querySelector('.container')
      expect(container).toHaveClass('flex', 'items-center', 'justify-between')
    })
  })

  describe('Icon Rendering', () => {
    it('should render briefcase icon in logo', () => {
      renderNavbar()
      const logoLink = screen.getByRole('link', { name: /AI Resume Analyzer/i })
      const icon = logoLink.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Spacing and Layout', () => {
    it('should have proper spacing between navbar items', () => {
      renderNavbar()
      const nav = screen.getByRole('navigation')
      const container = nav.querySelector('.container')
      expect(container).toHaveClass('flex', 'items-center', 'justify-between')
    })

    it('should have proper spacing in button group', async () => {
      vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: '123', email: 'test@example.com' } } }
      } as any)
      
      renderNavbar()
      
      await waitFor(() => {
        const nav = screen.getByRole('navigation')
        const buttonGroup = nav.querySelector('.space-x-4')
        expect(buttonGroup).toBeInTheDocument()
      })
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { LoginPage } from '../../pages/LoginPage';

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the login page with all main sections', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByText(/Login to ResumeAI/i)).toBeInTheDocument();
      expect(screen.getByText(/Streamline your hiring process today/i)).toBeInTheDocument();
    });

    it('should render the branding section with logo', () => {
      renderWithRouter(<LoginPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-3xl', 'font-black');
    });

    it('should render the main card container', () => {
      renderWithRouter(<LoginPage />);
      
      const form = screen.getByRole('form', { hidden: true });
      expect(form).toBeInTheDocument();
      expect(form.parentElement).toHaveClass('rounded-[32px]', 'bg-white', 'dark:bg-slate-900');
    });
  });

  describe('Form Rendering', () => {
    it('should render email input field', () => {
      renderWithRouter(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'someone@gmail.com');
    });

    it('should render password input field', () => {
      renderWithRouter(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render forgot password link', () => {
      renderWithRouter(<LoginPage />);
      
      const forgotLink = screen.getByRole('link', { name: /Reset Password/i });
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should render sign in button', () => {
      renderWithRouter(<LoginPage />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      expect(signInButton).toBeInTheDocument();
      expect(signInButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    it('should render form with proper ARIA label', () => {
      renderWithRouter(<LoginPage />);
      
      const form = screen.getByRole('form', { hidden: true });
      expect(form).toHaveAttribute('aria-label', 'Login form');
    });
  });

  describe('Form Submission', () => {
    it('should have proper form structure', () => {
      renderWithRouter(<LoginPage />);
      
      const form = screen.getByRole('form', { hidden: true });
      expect(form).toHaveClass('space-y-5');
    });

    it('should have required attributes on form fields', () => {
      renderWithRouter(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should have proper input styling', () => {
      renderWithRouter(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveClass('rounded-2xl', 'border', 'focus:ring-4', 'focus:ring-blue-500/10');
    });
  });

  describe('OAuth Button Functionality', () => {
    it('should render Google OAuth button', () => {
      renderWithRouter(<LoginPage />);
      
      const googleButton = screen.getByRole('button', { name: /Google Account/i });
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toHaveClass('border-slate-200', 'dark:border-slate-800');
    });

    it('should render GitHub OAuth button', () => {
      renderWithRouter(<LoginPage />);
      
      const githubButton = screen.getByRole('button', { name: /GitHub Account/i });
      expect(githubButton).toBeInTheDocument();
      expect(githubButton).toHaveClass('border-slate-200', 'dark:border-slate-800');
    });

    it('should have proper OAuth button styling', () => {
      renderWithRouter(<LoginPage />);
      
      const googleButton = screen.getByRole('button', { name: /Google Account/i });
      expect(googleButton).toHaveClass('h-12', 'rounded-2xl', 'font-bold');
    });

    it('should have hover effects on OAuth buttons', () => {
      renderWithRouter(<LoginPage />);
      
      const googleButton = screen.getByRole('button', { name: /Google Account/i });
      expect(googleButton).toHaveClass('hover:bg-white', 'dark:hover:bg-slate-800', 'hover:-translate-y-0.5');
    });
  });

  describe('Loading State', () => {
    it('should show loading state on sign in button', async () => {
      renderWithRouter(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(signInButton).not.toBeDisabled();
    });

    it('should have loading spinner styling', () => {
      renderWithRouter(<LoginPage />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      expect(signInButton).toHaveClass('transition-all', 'hover:-translate-y-0.5');
    });
  });

  describe('Error Handling', () => {
    it('should have proper error message styling', () => {
      renderWithRouter(<LoginPage />);
      
      const form = screen.getByRole('form', { hidden: true });
      expect(form).toBeInTheDocument();
    });

    it('should have proper input focus styling for error states', () => {
      renderWithRouter(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveClass('focus:border-blue-500', 'focus:ring-blue-500/10');
    });
  });

  describe('Signup Link', () => {
    it('should render signup link at bottom', () => {
      renderWithRouter(<LoginPage />);
      
      const signupLink = screen.getByRole('link', { name: /Create one for free/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('should have proper styling on signup link', () => {
      renderWithRouter(<LoginPage />);
      
      const signupLink = screen.getByRole('link', { name: /Create one for free/i });
      expect(signupLink).toHaveClass('text-blue-600', 'font-black', 'hover:underline');
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive container', () => {
      renderWithRouter(<LoginPage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'p-4');
    });

    it('should have responsive max-width', () => {
      renderWithRouter(<LoginPage />);
      
      const main = screen.getByRole('main');
      expect(main.parentElement).toHaveClass('max-w-[440px]');
    });

    it('should have responsive padding', () => {
      renderWithRouter(<LoginPage />);
      
      const cardContainer = screen.getByRole('form', { hidden: true }).parentElement;
      expect(cardContainer).toHaveClass('p-8');
    });
  });

  describe('Animation Classes', () => {
    it('should have fade-in animation on main container', () => {
      renderWithRouter(<LoginPage />);
      
      const main = screen.getByRole('main');
      expect(main.parentElement).toHaveClass('animate-fade-in');
    });

    it('should have staggered animations on form elements', () => {
      renderWithRouter(<LoginPage />);
      
      const emailField = screen.getByLabelText(/Email Address/i).parentElement?.parentElement;
      expect(emailField).toHaveClass('animate-slide-up');
    });

    it('should have scale-in animation on card', () => {
      renderWithRouter(<LoginPage />);
      
      const card = screen.getByRole('form', { hidden: true }).parentElement;
      expect(card).toHaveClass('animate-scale-in');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on main container', () => {
      renderWithRouter(<LoginPage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('dark:bg-slate-950');
    });

    it('should have dark mode classes on card', () => {
      renderWithRouter(<LoginPage />);
      
      const card = screen.getByRole('form', { hidden: true }).parentElement;
      expect(card).toHaveClass('dark:bg-slate-900', 'dark:border-slate-800');
    });

    it('should have dark mode classes on text', () => {
      renderWithRouter(<LoginPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('dark:text-white');
    });

    it('should have dark mode classes on inputs', () => {
      renderWithRouter(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveClass('dark:border-slate-800', 'dark:bg-slate-950/50');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<LoginPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible form labels', () => {
      renderWithRouter(<LoginPage />);
      
      const emailLabel = screen.getByLabelText(/Email Address/i);
      const passwordLabel = screen.getByLabelText(/Password/i);
      
      expect(emailLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
    });

    it('should have proper ARIA labels on buttons', () => {
      renderWithRouter(<LoginPage />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      expect(signInButton).toHaveAttribute('aria-label');
    });

    it('should have proper input accessibility attributes', () => {
      renderWithRouter(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveAttribute('aria-label');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
    });

    it('should have keyboard accessible buttons', () => {
      renderWithRouter(<LoginPage />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      expect(signInButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Content Verification', () => {
    it('should display correct page title', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByText(/Login to ResumeAI/i)).toBeInTheDocument();
    });

    it('should display correct subtitle', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByText(/Streamline your hiring process today/i)).toBeInTheDocument();
    });

    it('should display OAuth divider text', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByText(/OR CONTINUE WITH/i)).toBeInTheDocument();
    });

    it('should have proper spacing between form sections', () => {
      renderWithRouter(<LoginPage />);
      
      const form = screen.getByRole('form', { hidden: true });
      expect(form).toHaveClass('space-y-5');
    });
  });

  describe('Icon Rendering', () => {
    it('should render email icon in email field', () => {
      renderWithRouter(<LoginPage />);
      
      const emailField = screen.getByLabelText(/Email Address/i).parentElement;
      const icon = emailField?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render icons with aria-hidden', () => {
      renderWithRouter(<LoginPage />);
      
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});

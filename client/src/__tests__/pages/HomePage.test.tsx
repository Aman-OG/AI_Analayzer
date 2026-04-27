import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { HomePage } from '../../pages/HomePage';

// Mock the useReducedMotion hook
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('HomePage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the home page with all main sections', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText(/Screen Resumes with/i)).toBeInTheDocument();
      expect(screen.getByText(/Intelligence/i)).toBeInTheDocument();
    });

    it('should render the hero section with tagline', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText(/Powered by Llama 3 & Groq/i)).toBeInTheDocument();
      expect(screen.getByText(/Stop manual screening/i)).toBeInTheDocument();
    });

    it('should render the main heading with proper styling', () => {
      renderWithRouter(<HomePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-6xl', 'md:text-7xl', 'font-extrabold');
    });

    it('should render the subheading with proper styling', () => {
      renderWithRouter(<HomePage />);
      
      const subheading = screen.getByText(/Stop manual screening/i);
      expect(subheading).toBeInTheDocument();
      expect(subheading).toHaveClass('text-lg', 'md:text-xl');
    });
  });

  describe('CTA Button Functionality', () => {
    it('should render "Start Hiring Now" button', () => {
      renderWithRouter(<HomePage />);
      
      const startButton = screen.getByRole('link', { name: /Start Hiring Now/i });
      expect(startButton).toBeInTheDocument();
      expect(startButton).toHaveAttribute('href', '/signup');
    });

    it('should render "Welcome Back" button', () => {
      renderWithRouter(<HomePage />);
      
      const welcomeButton = screen.getByRole('link', { name: /Welcome Back/i });
      expect(welcomeButton).toBeInTheDocument();
      expect(welcomeButton).toHaveAttribute('href', '/login');
    });

    it('should have proper button styling for CTA buttons', () => {
      renderWithRouter(<HomePage />);
      
      const startButton = screen.getByRole('link', { name: /Start Hiring Now/i });
      expect(startButton.querySelector('button')).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    it('should have hover animation classes on CTA buttons', () => {
      renderWithRouter(<HomePage />);
      
      const startButton = screen.getByRole('link', { name: /Start Hiring Now/i });
      expect(startButton.querySelector('button')).toHaveClass('hover:-translate-y-0.5', 'transition-all');
    });
  });

  describe('Feature Cards Rendering', () => {
    it('should render all three feature cards', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText(/Deep Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Real-time Ranking/i)).toBeInTheDocument();
      expect(screen.getByText(/Privacy First/i)).toBeInTheDocument();
    });

    it('should render feature card descriptions', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText(/Our AI goes beyond keywords/i)).toBeInTheDocument();
      expect(screen.getByText(/Instantly score candidates/i)).toBeInTheDocument();
      expect(screen.getByText(/Automatic PII redaction/i)).toBeInTheDocument();
    });

    it('should render feature cards with proper styling', () => {
      renderWithRouter(<HomePage />);
      
      const featureSection = screen.getByRole('region', { hidden: true });
      expect(featureSection).toHaveClass('grid', 'md:grid-cols-3', 'gap-8');
    });

    it('should render feature cards with hover effects', () => {
      renderWithRouter(<HomePage />);
      
      const articles = screen.getAllByRole('article');
      articles.forEach(article => {
        expect(article).toHaveClass('hover:scale-102', 'hover:shadow-2xl');
      });
    });

    it('should render feature card icons with proper styling', () => {
      renderWithRouter(<HomePage />);
      
      const articles = screen.getAllByRole('article');
      articles.forEach(article => {
        const iconContainer = article.querySelector('div[class*="bg-blue-500"]');
        expect(iconContainer).toHaveClass('rounded-2xl', 'flex', 'items-center', 'justify-center');
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive container classes', () => {
      renderWithRouter(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('container', 'mx-auto', 'px-4');
    });

    it('should have responsive heading sizes', () => {
      renderWithRouter(<HomePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-6xl', 'md:text-7xl');
    });

    it('should have responsive button layout', () => {
      renderWithRouter(<HomePage />);
      
      const buttonContainer = screen.getByRole('link', { name: /Start Hiring Now/i }).parentElement;
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-4');
    });

    it('should have responsive feature grid', () => {
      renderWithRouter(<HomePage />);
      
      const featureSection = screen.getByRole('region', { hidden: true });
      expect(featureSection).toHaveClass('grid', 'md:grid-cols-3');
    });
  });

  describe('Animation Classes', () => {
    it('should have fade-in animation on main content', () => {
      renderWithRouter(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main.parentElement).toHaveClass('animate-fade-in');
    });

    it('should have staggered animation classes on hero section', () => {
      renderWithRouter(<HomePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.parentElement?.parentElement).toHaveClass('animate-slide-up');
    });

    it('should have staggered animation on feature cards', () => {
      renderWithRouter(<HomePage />);
      
      const featureSection = screen.getByRole('region', { hidden: true });
      expect(featureSection).toHaveClass('animate-fade-in');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on main container', () => {
      renderWithRouter(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main.parentElement).toHaveClass('dark:from-slate-950', 'dark:via-blue-950', 'dark:to-slate-950');
    });

    it('should have dark mode classes on text elements', () => {
      renderWithRouter(<HomePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('dark:text-white');
    });

    it('should have dark mode classes on feature cards', () => {
      renderWithRouter(<HomePage />);
      
      const articles = screen.getAllByRole('article');
      articles.forEach(article => {
        expect(article).toHaveClass('dark:bg-slate-900/50', 'dark:border-slate-800');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<HomePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible links with proper labels', () => {
      renderWithRouter(<HomePage />);
      
      const startButton = screen.getByRole('link', { name: /Start Hiring Now/i });
      expect(startButton).toHaveAttribute('href');
    });

    it('should have feature section with proper ARIA label', () => {
      renderWithRouter(<HomePage />);
      
      const featureSection = screen.getByRole('region', { hidden: true });
      expect(featureSection).toHaveAttribute('aria-label', 'Key features');
    });

    it('should have proper icon accessibility with aria-hidden', () => {
      renderWithRouter(<HomePage />);
      
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Content Verification', () => {
    it('should display the correct tagline', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText(/Powered by Llama 3 & Groq/i)).toBeInTheDocument();
    });

    it('should display all feature titles', () => {
      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('Deep Analysis')).toBeInTheDocument();
      expect(screen.getByText('Real-time Ranking')).toBeInTheDocument();
      expect(screen.getByText('Privacy First')).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      renderWithRouter(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('space-y-12');
    });
  });

  describe('Background', () => {
    it('should have background class', () => {
      const { container } = renderWithProviders(<HomePage />);
      expect(container.firstChild).toHaveClass('bg-background');
    });
  });
});

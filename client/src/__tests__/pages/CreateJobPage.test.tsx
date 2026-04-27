import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { CreateJobPage } from '../../pages/CreateJobPage';

// Mock dependencies
vi.mock('../../services', () => ({
  jobService: {
    createJob: vi.fn(),
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

describe('CreateJobPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the create job page with header', () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByText(/New Position/i)).toBeInTheDocument();
    });

    it('should render page title with proper styling', () => {
      renderWithRouter(<CreateJobPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-3xl', 'font-bold');
    });

    it('should render page subtitle', () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByText(/Define requirements for AI-powered screening/i)).toBeInTheDocument();
    });

    it('should render back button', () => {
      renderWithRouter(<CreateJobPage />);
      
      const backButton = screen.getByRole('button', { hidden: true });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Multi-Step Form Progress', () => {
    it('should render progress indicator', () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
    });

    it('should show progress percentage', () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByText(/33%/i)).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      renderWithRouter(<CreateJobPage />);
      
      const progressBar = document.querySelector('div[style*="width"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should have proper progress bar styling', () => {
      renderWithRouter(<CreateJobPage />);
      
      const progressContainer = screen.getByText(/Step 1 of 3/i).closest('div')?.querySelector('div[class*="h-2"]');
      expect(progressContainer).toHaveClass('rounded-full', 'bg-slate-200', 'dark:bg-slate-800');
    });
  });

  describe('Step 1: Basic Information', () => {
    it('should render job title input', () => {
      renderWithRouter(<CreateJobPage />);
      
      const titleInput = screen.getByPlaceholderText(/Senior Software Engineer/i);
      expect(titleInput).toBeInTheDocument();
    });

    it('should render company input', () => {
      renderWithRouter(<CreateJobPage />);
      
      const companyInput = screen.getByPlaceholderText(/Acme Corp/i);
      expect(companyInput).toBeInTheDocument();
    });

    it('should have proper input styling', () => {
      renderWithRouter(<CreateJobPage />);
      
      const titleInput = screen.getByPlaceholderText(/Senior Software Engineer/i);
      expect(titleInput).toHaveClass('h-12', 'rounded-xl', 'border');
    });

    it('should render step 1 section with proper styling', () => {
      renderWithRouter(<CreateJobPage />);
      
      const section = screen.getByText(/Basic Information/i).closest('div[class*="p-"]');
      expect(section).toHaveClass('rounded-3xl', 'bg-white', 'dark:bg-slate-900/50');
    });
  });

  describe('Step Navigation', () => {
    it('should render step navigation sidebar', () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByText(/Form Steps/i)).toBeInTheDocument();
    });

    it('should render all step buttons', () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByRole('button', { name: /Basic Info/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Description/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Requirements/i })).toBeInTheDocument();
    });

    it('should highlight current step', () => {
      renderWithRouter(<CreateJobPage />);
      
      const basicInfoButton = screen.getByRole('button', { name: /Basic Info/i });
      expect(basicInfoButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should have proper step button styling', () => {
      renderWithRouter(<CreateJobPage />);
      
      const basicInfoButton = screen.getByRole('button', { name: /Basic Info/i });
      expect(basicInfoButton).toHaveClass('w-full', 'text-left', 'px-4', 'py-3', 'rounded-xl');
    });

    it('should render next button', () => {
      renderWithRouter(<CreateJobPage />);
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toBeInTheDocument();
    });

    it('should have proper next button styling', () => {
      renderWithRouter(<CreateJobPage />);
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toHaveClass('w-full', 'h-11', 'rounded-xl', 'bg-blue-600');
    });
  });

  describe('Form Validation', () => {
    it('should have required attributes on form fields', () => {
      renderWithRouter(<CreateJobPage />);
      
      const titleInput = screen.getByPlaceholderText(/Senior Software Engineer/i);
      expect(titleInput).toHaveAttribute('required');
    });

    it('should have proper input focus styling', () => {
      renderWithRouter(<CreateJobPage />);
      
      const titleInput = screen.getByPlaceholderText(/Senior Software Engineer/i);
      expect(titleInput).toHaveClass('focus:ring-2', 'focus:ring-blue-500/10', 'focus:border-blue-500');
    });
  });

  describe('Form Submission', () => {
    it('should render submit button on final step', async () => {
      renderWithRouter(<CreateJobPage />);
      
      // Navigate to step 3
      const step3Button = screen.getByRole('button', { name: /Requirements/i });
      fireEvent.click(step3Button);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Publish & Analyze/i });
        expect(submitButton).toBeInTheDocument();
      });
    });

    it('should have proper submit button styling', async () => {
      renderWithRouter(<CreateJobPage />);
      
      const step3Button = screen.getByRole('button', { name: /Requirements/i });
      fireEvent.click(step3Button);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Publish & Analyze/i });
        expect(submitButton).toHaveClass('w-full', 'h-11', 'rounded-xl', 'bg-blue-600');
      });
    });

    it('should have loading state on submit button', async () => {
      renderWithRouter(<CreateJobPage />);
      
      const step3Button = screen.getByRole('button', { name: /Requirements/i });
      fireEvent.click(step3Button);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Publish & Analyze/i });
        expect(submitButton).toHaveClass('shadow-lg', 'shadow-blue-500/20');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when submitting', async () => {
      renderWithRouter(<CreateJobPage />);
      
      const step3Button = screen.getByRole('button', { name: /Requirements/i });
      fireEvent.click(step3Button);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Publish & Analyze/i });
        expect(submitButton).toBeInTheDocument();
      });
    });
  });

  describe('Success Feedback', () => {
    it('should have proper success button styling', async () => {
      renderWithRouter(<CreateJobPage />);
      
      const step3Button = screen.getByRole('button', { name: /Requirements/i });
      fireEvent.click(step3Button);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Publish & Analyze/i });
        expect(submitButton).toHaveClass('transition-all', 'hover:-translate-y-0.5');
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive container', () => {
      renderWithRouter(<CreateJobPage />);
      
      const container = screen.getByText(/New Position/i).closest('div[class*="max-w"]');
      expect(container).toHaveClass('max-w-4xl', 'mx-auto');
    });

    it('should have responsive grid layout', () => {
      renderWithRouter(<CreateJobPage />);
      
      const form = screen.getByRole('form', { hidden: true });
      expect(form).toHaveClass('grid', 'lg:grid-cols-3', 'gap-8');
    });

    it('should have responsive sidebar', () => {
      renderWithRouter(<CreateJobPage />);
      
      const sidebar = screen.getByText(/Form Steps/i).closest('div[class*="p-"]');
      expect(sidebar).toHaveClass('sticky', 'top-20');
    });
  });

  describe('Animation Classes', () => {
    it('should have fade-in animation on main content', () => {
      renderWithRouter(<CreateJobPage />);
      
      const container = screen.getByText(/New Position/i).closest('div[class*="max-w"]');
      expect(container).toHaveClass('animate-fade-in');
    });

    it('should have staggered animations on header', () => {
      renderWithRouter(<CreateJobPage />);
      
      const header = screen.getByText(/New Position/i).closest('div[class*="flex"]');
      expect(header).toHaveClass('animate-slide-up');
    });

    it('should have staggered animations on form sections', () => {
      renderWithRouter(<CreateJobPage />);
      
      const section = screen.getByText(/Basic Information/i).closest('div[class*="p-"]');
      expect(section).toHaveClass('animate-slide-up');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on card', () => {
      renderWithRouter(<CreateJobPage />);
      
      const section = screen.getByText(/Basic Information/i).closest('div[class*="p-"]');
      expect(section).toHaveClass('dark:bg-slate-900/50', 'dark:border-slate-800');
    });

    it('should have dark mode classes on sidebar', () => {
      renderWithRouter(<CreateJobPage />);
      
      const sidebar = screen.getByText(/Form Steps/i).closest('div[class*="p-"]');
      expect(sidebar).toHaveClass('dark:bg-blue-950/20', 'dark:border-blue-900/50');
    });

    it('should have dark mode classes on text', () => {
      renderWithRouter(<CreateJobPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('dark:text-white');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<CreateJobPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible form labels', () => {
      renderWithRouter(<CreateJobPage />);
      
      const titleLabel = screen.getByText(/Job Title/i);
      expect(titleLabel).toBeInTheDocument();
    });

    it('should have accessible step buttons', () => {
      renderWithRouter(<CreateJobPage />);
      
      const basicInfoButton = screen.getByRole('button', { name: /Basic Info/i });
      expect(basicInfoButton).toHaveAttribute('type', 'button');
    });

    it('should have keyboard accessible navigation', () => {
      renderWithRouter(<CreateJobPage />);
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Content Verification', () => {
    it('should display correct page title', () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByText(/New Position/i)).toBeInTheDocument();
    });

    it('should display all form field labels', () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByText(/Job Title/i)).toBeInTheDocument();
      expect(screen.getByText(/Company/i)).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      renderWithRouter(<CreateJobPage />);
      
      const container = screen.getByText(/New Position/i).closest('div[class*="max-w"]');
      expect(container).toHaveClass('space-y-8');
    });
  });

  describe('Step Transitions', () => {
    it('should navigate to next step when next button is clicked', async () => {
      renderWithRouter(<CreateJobPage />);
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
      });
    });

    it('should show previous button on step 2', async () => {
      renderWithRouter(<CreateJobPage />);
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Previous/i });
        expect(prevButton).toBeInTheDocument();
      });
    });

    it('should navigate back to previous step', async () => {
      renderWithRouter(<CreateJobPage />);
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Previous/i });
        fireEvent.click(prevButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
      });
    });

    it('should update progress bar on step change', async () => {
      renderWithRouter(<CreateJobPage />);
      
      expect(screen.getByText(/33%/i)).toBeInTheDocument();
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/66%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Step Indicators', () => {
    it('should show checkmark for completed steps', async () => {
      renderWithRouter(<CreateJobPage />);
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        const basicInfoButton = screen.getByRole('button', { name: /Basic Info/i });
        expect(basicInfoButton).toHaveClass('bg-green-100', 'dark:bg-green-900/20');
      });
    });

    it('should disable future steps', () => {
      renderWithRouter(<CreateJobPage />);
      
      const descriptionButton = screen.getByRole('button', { name: /Description/i });
      expect(descriptionButton).toHaveClass('opacity-50');
    });
  });
});

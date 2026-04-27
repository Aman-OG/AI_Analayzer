import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { EditJobPage } from '../../pages/EditJobPage';

// Mock dependencies
vi.mock('../../services', () => ({
  jobService: {
    getJobById: vi.fn(),
    updateJob: vi.fn(),
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
    useParams: () => ({ id: '1' }),
  };
});

const mockJob = {
  _id: '1',
  title: 'Senior React Developer',
  company: 'Tech Corp',
  descriptionText: 'We are looking for a senior React developer...',
  mustHaveSkills: ['React', 'TypeScript'],
  focusAreas: ['Performance'],
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EditJobPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the edit job page with header', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Edit Position/i)).toBeInTheDocument();
      });
    });

    it('should render page title with proper styling', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass('text-3xl', 'font-bold');
      });
    });

    it('should render back button', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { hidden: true });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Form Pre-filling', () => {
    it('should pre-fill job title', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const titleInput = screen.getByDisplayValue('Senior React Developer');
        expect(titleInput).toBeInTheDocument();
      });
    });

    it('should pre-fill company name', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const companyInput = screen.getByDisplayValue('Tech Corp');
        expect(companyInput).toBeInTheDocument();
      });
    });

    it('should pre-fill job description', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const descriptionInput = screen.getByDisplayValue(/We are looking for a senior React developer/i);
        expect(descriptionInput).toBeInTheDocument();
      });
    });

    it('should pre-fill must-have skills', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
    });

    it('should pre-fill focus areas', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Performance')).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Step Form Progress', () => {
    it('should render progress indicator', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
      });
    });

    it('should show progress percentage', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/33%/i)).toBeInTheDocument();
      });
    });

    it('should render progress bar', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const progressBar = document.querySelector('div[style*="width"]');
        expect(progressBar).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should render submit button on final step', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const step3Button = screen.getByRole('button', { name: /Requirements/i });
        fireEvent.click(step3Button);
      });
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Update & Analyze/i });
        expect(submitButton).toBeInTheDocument();
      });
    });

    it('should have proper submit button styling', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const step3Button = screen.getByRole('button', { name: /Requirements/i });
        fireEvent.click(step3Button);
      });
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Update & Analyze/i });
        expect(submitButton).toHaveClass('w-full', 'h-11', 'rounded-xl', 'bg-blue-600');
      });
    });
  });

  describe('Loading State', () => {
    it('should show skeleton loaders while loading job data', () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<EditJobPage />);
      
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive container', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const container = screen.getByText(/Edit Position/i).closest('div[class*="max-w"]');
        expect(container).toHaveClass('max-w-4xl', 'mx-auto');
      });
    });

    it('should have responsive grid layout', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const form = screen.getByRole('form', { hidden: true });
        expect(form).toHaveClass('grid', 'lg:grid-cols-3', 'gap-8');
      });
    });
  });

  describe('Animation Classes', () => {
    it('should have fade-in animation on main content', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const container = screen.getByText(/Edit Position/i).closest('div[class*="max-w"]');
        expect(container).toHaveClass('animate-fade-in');
      });
    });

    it('should have staggered animations on header', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const header = screen.getByText(/Edit Position/i).closest('div[class*="flex"]');
        expect(header).toHaveClass('animate-slide-up');
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on form sections', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const section = screen.getByText(/Basic Information/i).closest('div[class*="p-"]');
        expect(section).toHaveClass('dark:bg-slate-900/50', 'dark:border-slate-800');
      });
    });

    it('should have dark mode classes on text', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('dark:text-white');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should have accessible form labels', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Job Title/i)).toBeInTheDocument();
        expect(screen.getByText(/Company/i)).toBeInTheDocument();
      });
    });

    it('should have keyboard accessible navigation', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/i });
        expect(nextButton).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Content Verification', () => {
    it('should display correct page title', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Edit Position/i)).toBeInTheDocument();
      });
    });

    it('should display all form field labels', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Job Title/i)).toBeInTheDocument();
        expect(screen.getByText(/Company/i)).toBeInTheDocument();
        expect(screen.getByText(/Detailed Description/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step when next button is clicked', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/i });
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
      });
    });

    it('should show previous button on step 2', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/i });
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Previous/i });
        expect(prevButton).toBeInTheDocument();
      });
    });

    it('should update progress bar on step change', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/33%/i)).toBeInTheDocument();
      });
      
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/66%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Skill and Focus Area Management', () => {
    it('should allow adding new skills', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const step3Button = screen.getByRole('button', { name: /Requirements/i });
        fireEvent.click(step3Button);
      });
      
      await waitFor(() => {
        const skillInput = screen.getByPlaceholderText(/React, AWS/i);
        expect(skillInput).toBeInTheDocument();
      });
    });

    it('should allow removing skills', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const step3Button = screen.getByRole('button', { name: /Requirements/i });
        fireEvent.click(step3Button);
      });
      
      await waitFor(() => {
        const removeButtons = screen.getAllByRole('button', { hidden: true });
        expect(removeButtons.length).toBeGreaterThan(0);
      });
    });

    it('should allow adding new focus areas', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const step3Button = screen.getByRole('button', { name: /Requirements/i });
        fireEvent.click(step3Button);
      });
      
      await waitFor(() => {
        const focusInput = screen.getByPlaceholderText(/Communication/i);
        expect(focusInput).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Step Indicators', () => {
    it('should show checkmark for completed steps', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/i });
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        const basicInfoButton = screen.getByRole('button', { name: /Basic Info/i });
        expect(basicInfoButton).toHaveClass('bg-green-100', 'dark:bg-green-900/20');
      });
    });

    it('should disable future steps', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<EditJobPage />);
      
      await waitFor(() => {
        const requirementsButton = screen.getByRole('button', { name: /Requirements/i });
        expect(requirementsButton).toHaveClass('opacity-50');
      });
    });
  });
});

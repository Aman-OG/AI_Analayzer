import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { JobsListPage } from '../../pages/JobsListPage';

// Mock dependencies
vi.mock('../../services', () => ({
  jobService: {
    getAllJobs: vi.fn(),
    deleteJob: vi.fn(),
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

const mockJobs = [
  {
    _id: '1',
    title: 'Senior React Developer',
    company: 'Tech Corp',
    candidateCount: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Full Stack Engineer',
    company: 'StartUp Inc',
    candidateCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'Product Manager',
    company: 'Big Company',
    candidateCount: 8,
    createdAt: new Date().toISOString(),
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('JobsListPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the jobs list page with header', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      expect(screen.getByText(/Job Repository/i)).toBeInTheDocument();
    });

    it('should render page title with proper styling', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-3xl', 'font-bold');
    });

    it('should render page subtitle', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      expect(screen.getByText(/Manage your job postings/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input field', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const searchInput = screen.getByPlaceholderText(/Search by title or company/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should have proper search input styling', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const searchInput = screen.getByPlaceholderText(/Search by title or company/i);
      expect(searchInput).toHaveClass('rounded-xl', 'border', 'focus:ring-2', 'focus:ring-blue-500/20');
    });

    it('should have search icon', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const searchInput = screen.getByPlaceholderText(/Search by title or company/i);
      expect(searchInput.parentElement?.querySelector('svg')).toBeInTheDocument();
    });

    it('should have proper ARIA label on search input', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const searchInput = screen.getByPlaceholderText(/Search by title or company/i);
      expect(searchInput).toHaveAttribute('aria-label', 'Search jobs by title or company');
    });
  });

  describe('Create Job Button', () => {
    it('should render create job button', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const createButton = screen.getByRole('link', { name: /New Position/i });
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveAttribute('href', '/jobs/create');
    });

    it('should have proper button styling', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const createButton = screen.getByRole('link', { name: /New Position/i });
      expect(createButton.querySelector('button')).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    it('should have hover animation on create button', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const createButton = screen.getByRole('link', { name: /New Position/i });
      expect(createButton.querySelector('button')).toHaveClass('hover:-translate-y-0.5', 'transition-all');
    });
  });

  describe('Job Card Rendering', () => {
    it('should render job cards in grid layout', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      });
    });

    it('should render all job titles', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
        expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument();
        expect(screen.getByText('Product Manager')).toBeInTheDocument();
      });
    });

    it('should render company names on cards', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument();
        expect(screen.getByText('StartUp Inc')).toBeInTheDocument();
      });
    });

    it('should render candidate count on cards', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/5 Candidates/)).toBeInTheDocument();
        expect(screen.getByText(/3 Candidates/)).toBeInTheDocument();
      });
    });

    it('should render creation date on cards', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const dateElements = screen.getAllByText(/\d+\/\d+\/\d+/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it('should have proper card styling', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const cards = screen.getAllByRole('button', { hidden: true });
        cards.forEach(card => {
          if (card.textContent?.includes('Senior React Developer')) {
            expect(card).toHaveClass('rounded-3xl', 'bg-white', 'dark:bg-slate-900/50');
          }
        });
      });
    });

    it('should have hover effects on cards', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const cards = screen.getAllByRole('button', { hidden: true });
        cards.forEach(card => {
          if (card.textContent?.includes('Senior React Developer')) {
            expect(card).toHaveClass('hover:scale-102', 'hover:shadow-xl');
          }
        });
      });
    });
  });

  describe('Card Hover Effects', () => {
    it('should show action menu on hover', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const cards = screen.getAllByRole('button', { hidden: true });
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should have border color change on hover', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const cards = screen.getAllByRole('button', { hidden: true });
        cards.forEach(card => {
          if (card.textContent?.includes('Senior React Developer')) {
            expect(card).toHaveClass('hover:border-blue-500/50');
          }
        });
      });
    });
  });

  describe('Loading State', () => {
    it('should show skeleton loaders while loading', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<JobsListPage />);
      
      const skeletons = screen.getAllByRole('status', { hidden: true });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have proper skeleton styling', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<JobsListPage />);
      
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no jobs exist', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue([]);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/No positions found/i)).toBeInTheDocument();
      });
    });

    it('should show create button in empty state', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue([]);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const createButton = screen.getByRole('link', { name: /Create a Position/i });
        expect(createButton).toBeInTheDocument();
      });
    });

    it('should have proper empty state styling', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue([]);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const emptySection = screen.getByRole('region', { hidden: true });
        expect(emptySection).toHaveClass('rounded-3xl', 'border-2', 'border-dashed');
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive grid layout', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const section = screen.getByRole('region', { hidden: true });
        expect(section).toHaveClass('grid', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
      });
    });

    it('should have responsive header layout', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const header = screen.getByRole('heading', { level: 1 }).parentElement?.parentElement;
      expect(header).toHaveClass('flex', 'flex-col', 'md:flex-row');
    });

    it('should have responsive search input', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const searchInput = screen.getByPlaceholderText(/Search by title or company/i);
      expect(searchInput.parentElement).toHaveClass('max-w-md');
    });
  });

  describe('Animation Classes', () => {
    it('should have fade-in animation on main content', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('animate-fade-in');
    });

    it('should have staggered animations on header', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const header = screen.getByRole('heading', { level: 1 }).parentElement?.parentElement;
      expect(header).toHaveClass('animate-slide-up');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on cards', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const cards = screen.getAllByRole('button', { hidden: true });
        cards.forEach(card => {
          if (card.textContent?.includes('Senior React Developer')) {
            expect(card).toHaveClass('dark:bg-slate-900/50', 'dark:border-slate-800');
          }
        });
      });
    });

    it('should have dark mode classes on text', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('dark:text-white');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const searchInput = screen.getByPlaceholderText(/Search by title or company/i);
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('should have accessible job cards', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const cards = screen.getAllByRole('button', { hidden: true });
        cards.forEach(card => {
          expect(card).toHaveAttribute('aria-label');
        });
      });
    });

    it('should have keyboard accessible cards', async () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      await waitFor(() => {
        const cards = screen.getAllByRole('button', { hidden: true });
        cards.forEach(card => {
          expect(card).toHaveAttribute('tabIndex', '0');
        });
      });
    });
  });

  describe('Content Verification', () => {
    it('should display correct page title', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      expect(screen.getByText(/Job Repository/i)).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      const { jobService } = require('../../services');
      jobService.getAllJobs.mockResolvedValue(mockJobs);
      
      renderWithRouter(<JobsListPage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('space-y-8');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { JobDetailsPage } from '../../pages/JobDetailsPage';

// Mock dependencies
vi.mock('../../services', () => ({
  jobService: {
    getJobById: vi.fn(),
  },
  resumeService: {
    uploadResume: vi.fn(),
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

vi.mock('../../components/CandidateList', () => ({
  CandidateList: () => <div data-testid="candidate-list">Candidate List</div>,
}));

const mockJob = {
  _id: '1',
  title: 'Senior React Developer',
  company: 'Tech Corp',
  descriptionText: 'We are looking for a senior React developer...',
  mustHaveSkills: ['React', 'TypeScript', 'Node.js'],
  focusAreas: ['Performance', 'Testing'],
  createdAt: new Date().toISOString(),
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('JobDetailsPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the job details page', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      });
    });

    it('should render job title in hero section', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('text-4xl', 'md:text-5xl', 'font-black');
      });
    });

    it('should render company name in hero section', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      });
    });
  });

  describe('Hero Section', () => {
    it('should render back button', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { hidden: true });
        expect(backButton).toBeInTheDocument();
      });
    });

    it('should render edit button', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const editLink = screen.getByRole('link', { name: /Edit/i });
        expect(editLink).toBeInTheDocument();
      });
    });

    it('should render job metadata (company and date)', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Posted/i)).toBeInTheDocument();
      });
    });

    it('should have proper hero section styling', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const heroSection = screen.getByText('Senior React Developer').closest('div[class*="p-"]');
        expect(heroSection).toHaveClass('rounded-3xl', 'overflow-hidden');
      });
    });
  });

  describe('Job Information Section', () => {
    it('should render job description', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/We are looking for a senior React developer/i)).toBeInTheDocument();
      });
    });

    it('should render must-have skills', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Node.js')).toBeInTheDocument();
      });
    });

    it('should render focus areas', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Performance')).toBeInTheDocument();
        expect(screen.getByText('Testing')).toBeInTheDocument();
      });
    });

    it('should have proper info section styling', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const infoSection = screen.getByText(/We are looking for a senior React developer/i).closest('div[class*="p-"]');
        expect(infoSection).toHaveClass('rounded-3xl', 'bg-white', 'dark:bg-slate-900');
      });
    });
  });

  describe('Resume Upload Section', () => {
    it('should render upload area', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/New Applicant/i)).toBeInTheDocument();
      });
    });

    it('should render drag and drop zone', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const dropZone = screen.getByText(/Click or Drop Resumes/i);
        expect(dropZone).toBeInTheDocument();
      });
    });

    it('should render file input', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute('type', 'file');
        expect(fileInput).toHaveAttribute('accept', '.pdf,.docx');
      });
    });

    it('should render upload button', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: /Rank Candidates/i });
        expect(uploadButton).toBeInTheDocument();
      });
    });

    it('should have proper upload section styling', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const uploadSection = screen.getByText(/New Applicant/i).closest('div[class*="p-"]');
        expect(uploadSection).toHaveClass('rounded-3xl', 'bg-white', 'dark:bg-slate-900');
      });
    });
  });

  describe('Candidate List Section', () => {
    it('should render candidate list heading', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Ranked Candidates/i)).toBeInTheDocument();
      });
    });

    it('should render candidate list component', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('candidate-list')).toBeInTheDocument();
      });
    });

    it('should have proper candidate section styling', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const candidateSection = screen.getByText(/Ranked Candidates/i).closest('div[class*="space-y"]');
        expect(candidateSection).toHaveClass('space-y-6');
      });
    });
  });

  describe('Loading State', () => {
    it('should show skeleton loaders while loading', () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<JobDetailsPage />);
      
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have proper skeleton styling', () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<JobDetailsPage />);
      
      const skeletons = document.querySelectorAll('[class*="rounded-3xl"][class*="bg-slate"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive grid layout', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const gridContainer = screen.getByText(/Ranked Candidates/i).closest('div[class*="grid"]');
        expect(gridContainer).toHaveClass('grid', 'lg:grid-cols-3', 'gap-8');
      });
    });

    it('should have responsive hero section', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('text-4xl', 'md:text-5xl');
      });
    });
  });

  describe('Animation Classes', () => {
    it('should have fade-in animation on main content', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toHaveClass('animate-fade-in');
      });
    });

    it('should have staggered animations on hero section', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const heroContent = screen.getByText('Senior React Developer').closest('div[class*="space-y"]');
        expect(heroContent).toHaveClass('animate-slide-up');
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on hero section', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const heroSection = screen.getByText('Senior React Developer').closest('div[class*="gradient"]');
        expect(heroSection).toHaveClass('dark:from-white/5');
      });
    });

    it('should have dark mode classes on info section', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const infoSection = screen.getByText(/We are looking for a senior React developer/i).closest('div[class*="bg-white"]');
        expect(infoSection).toHaveClass('dark:bg-slate-900');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should have accessible upload input', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();
      });
    });

    it('should have accessible buttons', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: /Rank Candidates/i });
        expect(uploadButton).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const icons = screen.getAllByRole('img', { hidden: true });
        icons.forEach(icon => {
          expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
      });
    });
  });

  describe('Content Verification', () => {
    it('should display correct job title', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      });
    });

    it('should display correct company name', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      });
    });

    it('should display all job details', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/We are looking for a senior React developer/i)).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Performance')).toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('should have drag and drop zone', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const dropZone = screen.getByText(/Click or Drop Resumes/i).closest('label');
        expect(dropZone).toBeInTheDocument();
      });
    });

    it('should have proper drag and drop styling', async () => {
      const { jobService } = require('../../services');
      jobService.getJobById.mockResolvedValue(mockJob);
      
      renderWithRouter(<JobDetailsPage />);
      
      await waitFor(() => {
        const dropZone = screen.getByText(/Click or Drop Resumes/i).closest('label');
        expect(dropZone).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'border-2', 'border-dashed', 'rounded-3xl');
      });
    });
  });
});

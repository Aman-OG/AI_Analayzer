import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { ProfilePage } from '../../pages/ProfilePage';

// Mock dependencies
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    },
    updatePassword: vi.fn(),
  }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProfilePage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the profile page', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText(/test/i)).toBeInTheDocument();
    });

    it('should render user email in header', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('Profile Header Section', () => {
    it('should render profile avatar with initial', () => {
      renderWithRouter(<ProfilePage />);
      
      const avatar = document.querySelector('div[class*="h-28"][class*="w-28"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('rounded-3xl', 'bg-white/20', 'backdrop-blur-sm');
    });

    it('should render user initial in avatar', () => {
      renderWithRouter(<ProfilePage />);
      
      const avatar = document.querySelector('div[class*="h-28"][class*="w-28"]');
      expect(avatar?.textContent).toContain('T');
    });

    it('should render username from email', () => {
      renderWithRouter(<ProfilePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-4xl', 'font-black', 'text-white');
    });

    it('should have proper header styling', () => {
      renderWithRouter(<ProfilePage />);
      
      const header = document.querySelector('div[class*="p-10"]');
      expect(header).toHaveClass('rounded-[40px]', 'overflow-hidden');
    });

    it('should have hover effect on avatar', () => {
      renderWithRouter(<ProfilePage />);
      
      const avatar = document.querySelector('div[class*="h-28"][class*="w-28"]');
      expect(avatar).toHaveClass('group-hover:scale-105', 'group-hover:rotate-3', 'transition-transform');
    });

    it('should render email icon in header', () => {
      renderWithRouter(<ProfilePage />);
      
      const emailIcon = document.querySelector('div[class*="p-1.5"][class*="rounded-lg"]');
      expect(emailIcon).toBeInTheDocument();
    });
  });

  describe('Account Details Section', () => {
    it('should render account details card', () => {
      renderWithRouter(<ProfilePage />);
      
      const card = screen.getByText(/Security & Account/i).closest('div[class*="p-"]');
      expect(card).toHaveClass('rounded-[32px]', 'bg-white', 'dark:bg-slate-900');
    });

    it('should render security heading', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText(/Security & Account/i)).toBeInTheDocument();
    });

    it('should render member since information', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText(/Member Since/i)).toBeInTheDocument();
    });

    it('should render member date', () => {
      renderWithRouter(<ProfilePage />);
      
      const dateElements = screen.getAllByText(/\d+/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should have proper member info styling', () => {
      renderWithRouter(<ProfilePage />);
      
      const memberInfo = screen.getByText(/Member Since/i).closest('div[class*="p-"]');
      expect(memberInfo).toHaveClass('rounded-2xl', 'bg-slate-50', 'dark:bg-slate-800/40');
    });

    it('should render calendar icon for member date', () => {
      renderWithRouter(<ProfilePage />);
      
      const memberInfo = screen.getByText(/Member Since/i).closest('div[class*="p-"]');
      const icon = memberInfo?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Change Password Section', () => {
    it('should render change password button', () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      expect(changePasswordButton).toBeInTheDocument();
    });

    it('should have proper button styling', () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      expect(changePasswordButton).toHaveClass('w-full', 'h-12', 'rounded-xl', 'font-bold');
    });

    it('should show password form when button is clicked', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
      });
    });

    it('should render current password input in form', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const currentPasswordInput = screen.getByLabelText(/Current Password/i);
        expect(currentPasswordInput).toBeInTheDocument();
      });
    });

    it('should render new password input in form', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const newPasswordInput = screen.getByLabelText(/New Password/i);
        expect(newPasswordInput).toBeInTheDocument();
      });
    });

    it('should render confirm password input in form', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);
        expect(confirmPasswordInput).toBeInTheDocument();
      });
    });

    it('should render update password button in form', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const updateButton = screen.getByRole('button', { name: /Update Password/i });
        expect(updateButton).toBeInTheDocument();
      });
    });

    it('should render cancel button in form', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        expect(cancelButton).toBeInTheDocument();
      });
    });

    it('should have proper password form styling', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const form = screen.getByLabelText(/Current Password/i).closest('form');
        expect(form).toHaveClass('space-y-4', 'p-6', 'rounded-2xl');
      });
    });

    it('should hide password form when cancel is clicked', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByLabelText(/Current Password/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive container', () => {
      renderWithRouter(<ProfilePage />);
      
      const container = screen.getByText(/Security & Account/i).closest('div[class*="max-w"]');
      expect(container).toHaveClass('max-w-4xl', 'mx-auto');
    });

    it('should have responsive header layout', () => {
      renderWithRouter(<ProfilePage />);
      
      const header = document.querySelector('div[class*="flex"][class*="flex-col"]');
      expect(header).toHaveClass('flex', 'flex-col', 'md:flex-row');
    });

    it('should have responsive account details container', () => {
      renderWithRouter(<ProfilePage />);
      
      const container = screen.getByText(/Security & Account/i).closest('div[class*="max-w"]');
      expect(container).toHaveClass('max-w-xl', 'mx-auto');
    });
  });

  describe('Animation Classes', () => {
    it('should have fade-in animation on main content', () => {
      renderWithRouter(<ProfilePage />);
      
      const container = screen.getByText(/Security & Account/i).closest('div[class*="max-w"]');
      expect(container).toHaveClass('animate-fade-in');
    });

    it('should have staggered animations on header', () => {
      renderWithRouter(<ProfilePage />);
      
      const header = document.querySelector('div[class*="relative"][class*="p-10"]');
      expect(header).toHaveClass('animate-slide-up');
    });

    it('should have staggered animations on account details', () => {
      renderWithRouter(<ProfilePage />);
      
      const card = screen.getByText(/Security & Account/i).closest('div[class*="p-"]');
      expect(card).toHaveClass('animate-slide-up');
    });

    it('should have staggered animations on password form', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const form = screen.getByLabelText(/Current Password/i).closest('form');
        expect(form).toHaveClass('animate-slide-up');
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on header', () => {
      renderWithRouter(<ProfilePage />);
      
      const header = document.querySelector('div[class*="gradient"]');
      expect(header).toHaveClass('dark:from-white/5');
    });

    it('should have dark mode classes on account card', () => {
      renderWithRouter(<ProfilePage />);
      
      const card = screen.getByText(/Security & Account/i).closest('div[class*="p-"]');
      expect(card).toHaveClass('dark:bg-slate-900', 'dark:border-slate-800');
    });

    it('should have dark mode classes on member info', () => {
      renderWithRouter(<ProfilePage />);
      
      const memberInfo = screen.getByText(/Member Since/i).closest('div[class*="p-"]');
      expect(memberInfo).toHaveClass('dark:bg-slate-800/40', 'dark:border-slate-800');
    });

    it('should have dark mode classes on text', () => {
      renderWithRouter(<ProfilePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-white');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<ProfilePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible change password button', () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      expect(changePasswordButton).toHaveAttribute('type', 'button');
    });

    it('should have accessible password form inputs', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const currentPasswordInput = screen.getByLabelText(/Current Password/i);
        expect(currentPasswordInput).toHaveAttribute('required');
      });
    });

    it('should have accessible form labels', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels on icons', () => {
      renderWithRouter(<ProfilePage />);
      
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Content Verification', () => {
    it('should display correct user email', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should display security section heading', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText(/Security & Account/i)).toBeInTheDocument();
    });

    it('should display member since label', () => {
      renderWithRouter(<ProfilePage />);
      
      expect(screen.getByText(/Member Since/i)).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      renderWithRouter(<ProfilePage />);
      
      const card = screen.getByText(/Security & Account/i).closest('div[class*="p-"]');
      expect(card).toHaveClass('space-y-8');
    });
  });

  describe('Profile Image Hover Effect', () => {
    it('should have hover scale effect on avatar', () => {
      renderWithRouter(<ProfilePage />);
      
      const avatar = document.querySelector('div[class*="h-28"][class*="w-28"]');
      expect(avatar).toHaveClass('group-hover:scale-105');
    });

    it('should have hover rotation effect on avatar', () => {
      renderWithRouter(<ProfilePage />);
      
      const avatar = document.querySelector('div[class*="h-28"][class*="w-28"]');
      expect(avatar).toHaveClass('group-hover:rotate-3');
    });

    it('should have smooth transition on avatar', () => {
      renderWithRouter(<ProfilePage />);
      
      const avatar = document.querySelector('div[class*="h-28"][class*="w-28"]');
      expect(avatar).toHaveClass('transition-transform');
    });
  });

  describe('Section Animations', () => {
    it('should have animation on security section', () => {
      renderWithRouter(<ProfilePage />);
      
      const securitySection = screen.getByText(/Security & Account/i).closest('div[class*="space-y"]');
      expect(securitySection).toHaveClass('animate-slide-up');
    });

    it('should have animation on member info', () => {
      renderWithRouter(<ProfilePage />);
      
      const memberInfo = screen.getByText(/Member Since/i).closest('div[class*="p-"]');
      expect(memberInfo).toHaveClass('hover:shadow-lg', 'hover:shadow-blue-500/5');
    });
  });

  describe('Edit Functionality', () => {
    it('should allow editing password', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const currentPasswordInput = screen.getByLabelText(/Current Password/i);
        expect(currentPasswordInput).toBeInTheDocument();
      });
    });

    it('should have proper form validation', async () => {
      renderWithRouter(<ProfilePage />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        const updateButton = screen.getByRole('button', { name: /Update Password/i });
        expect(updateButton).toHaveClass('disabled:opacity-50');
      });
    });
  });
});

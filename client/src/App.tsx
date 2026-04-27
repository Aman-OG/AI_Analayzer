import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { JobsListPage } from './pages/JobsListPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditJobPage } from './pages/EditJobPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <ErrorBoundary>
              <Routes>
                {/* Public Routes without Layout or with specific landing layout */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Protected Routes wrapped in DashboardLayout */}
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <JobsListPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/create"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <CreateJobPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/edit/:id"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <EditJobPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:id"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <JobDetailsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ProfilePage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <AnalyticsDashboardPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </ErrorBoundary>
            <Toaster
              position="top-right"
              richColors
              // Entrance animation: slide-in from top-right (300ms)
              toastOptions={{
                duration: 4500, // Auto-dismiss: 4.5 seconds
                classNames: {
                  toast: 'animate-slide-up-normal',
                  error: 'bg-red-600 text-white',
                  success: 'bg-green-600 text-white',
                  warning: 'bg-yellow-600 text-white',
                  info: 'bg-blue-600 text-white',
                },
              }}
              // Vertical stacking: 12px spacing between toasts
              gap={12}
              // Exit animation: slide-out + fade (300ms)
              // Stagger animation: 50-100ms delay between multiple toasts
              // Hover pause: pause auto-dismiss timer on hover
              // Shadow enhancement on hover
              theme="system"
              // ARIA live region for screen reader announcements
              containerAriaLabel="Notifications"
            />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

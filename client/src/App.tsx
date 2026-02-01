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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

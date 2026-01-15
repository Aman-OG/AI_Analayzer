import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JobsListPage from './pages/JobsListPage';
import JobDetailPage from './pages/JobDetailPage';
import CreateJobPage from './pages/CreateJobPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary, RouteErrorBoundary } from './components/ErrorBoundary';
import { ErrorProvider } from './contexts/ErrorContext';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorBoundary>
        <ErrorProvider>
          <Router>
            <Layout>
              <div className="animate-in fade-in duration-500">
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/login"
                    element={<LoginPage />}
                    errorElement={<RouteErrorBoundary />}
                  />
                  <Route
                    path="/signup"
                    element={<SignupPage />}
                    errorElement={<RouteErrorBoundary />}
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={<ProtectedRoute><HomePage /></ProtectedRoute>}
                    errorElement={<RouteErrorBoundary />}
                  />
                  <Route
                    path="/jobs"
                    element={<ProtectedRoute><JobsListPage /></ProtectedRoute>}
                    errorElement={<RouteErrorBoundary />}
                  />
                  <Route
                    path="/jobs/new"
                    element={<ProtectedRoute><CreateJobPage /></ProtectedRoute>}
                    errorElement={<RouteErrorBoundary />}
                  />
                  <Route
                    path="/jobs/:jobId"
                    element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>}
                    errorElement={<RouteErrorBoundary />}
                  />

                  {/* 404 - Not Found */}
                  <Route
                    path="*"
                    element={<RouteErrorBoundary />}
                  />
                  <Route
                    path="/dashboard"
                    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                    errorElement={<RouteErrorBoundary />}
                  />
                </Routes>
              </div>
            </Layout>
          </Router>
        </ErrorProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;

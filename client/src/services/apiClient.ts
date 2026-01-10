// src/services/apiClient.ts
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { supabase } from '@/lib/supabaseClient';
import { AppError, NetworkError, ValidationError } from '@/lib/errors';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(new NetworkError('Failed to send request. Please check your connection.'));
  }
);

// Global response error handler with custom error types
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An unexpected error occurred';

      // Handle unauthorized across the app
      if (status === 401 && !window.location.pathname.includes('/login')) {
        console.warn('Session expired, redirecting to login.');
        supabase.auth.signOut();
        window.location.href = '/login';
        return Promise.reject(new AppError('Session expired. Please log in again.', 'UNAUTHORIZED', 401));
      }

      // Categorize common API errors
      if (status === 400 && error.response.data?.errors) {
        return Promise.reject(new ValidationError('Validation failed', error.response.data.errors));
      }

      return Promise.reject(new AppError(message, 'API_ERROR', status));
    } else if (error.request) {
      // The request was made but no response was received (Network error)
      return Promise.reject(new NetworkError('Unable to reach server. Please check your internet connection.'));
    } else {
      // Something happened in setting up the request
      return Promise.reject(new AppError(error.message || 'Request failed'));
    }
  }
);

export default apiClient;

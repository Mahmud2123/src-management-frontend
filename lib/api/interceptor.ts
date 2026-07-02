// lib/api/interceptor.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: '/api', // Use relative path for proxy
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('src_token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request configuration error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to landing page
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('src_user');
        localStorage.removeItem('src_token');
        // Redirect to landing page, not /auth
        // ✅ FIXED: Check if not already on landing page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      (error as any).customMessage = 'You do not have permission to perform this action.';
    }

    // Handle network errors
    if (!error.response) {
      let customMessage = 'Network error: Please check your connection';
      
      if (error.code === 'ECONNABORTED') {
        customMessage = 'Request timeout. The server is taking too long to respond.';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        customMessage = 'Unable to connect to the server. Please check if the server is running.';
      } else if (error.message === 'Network Error') {
        customMessage = 'Network error detected. Please check your internet connection.';
      }
      
      (error as any).customMessage = customMessage;
      (error as any).type = 'network';
    }

    // Handle server errors (5xx)
    if (error.response?.status && error.response.status >= 500) {
      (error as any).customMessage = 'Server error. Please try again later.';
      (error as any).type = 'server';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
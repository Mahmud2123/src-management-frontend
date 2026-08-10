// lib/api/interceptor.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Fast error message extraction
const getErrorMessage = (errorData: any): string => {
  if (!errorData) return 'An unexpected error occurred.';
  
  if (typeof errorData.message === 'string') return errorData.message;
  if (Array.isArray(errorData.message)) return errorData.message.join('. ');
  
  if (typeof errorData.message === 'object' && errorData.message !== null) {
    const firstKey = Object.keys(errorData.message)[0];
    if (firstKey && Array.isArray(errorData.message[firstKey])) {
      return errorData.message[firstKey][0] || 'Validation error';
    }
    return JSON.stringify(errorData.message);
  }
  
  if (typeof errorData.error === 'string') return errorData.error;
  
  if (typeof errorData.statusCode === 'number') {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Your session has expired. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'Resource not found.',
      500: 'Server error. Please try again later.',
    };
    return messages[errorData.statusCode] || `Error ${errorData.statusCode}`;
  }
  
  return 'An unexpected error occurred.';
};

// ✅ Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('src_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor with fast path
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[apiClient] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const path = error.config?.url;
    const errorData: any = error.response?.data;
    
    const userMessage = getErrorMessage(errorData);
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[apiClient ERROR ${status || 'NETWORK'}] ${path}`, errorData || error.message);
    }

    // ✅ Fast path for common errors
    if (status === 401) {
      if (path?.includes('/auth/login')) {
        (error as any).customMessage = errorData?.message || 'Invalid email or password.';
        return Promise.reject(error);
      }
      
      const isAuthEndpoint = path?.includes('/auth/') || path?.includes('/login');
      if (isAuthEndpoint) {
        (error as any).customMessage = userMessage || 'Authentication failed.';
        return Promise.reject(error);
      }
      
      const token = localStorage.getItem('src_token');
      if (token) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('src_user');
          localStorage.removeItem('src_token');
          document.cookie = 'src_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          
          const currentPath = window.location.pathname;
          if (!['/login', '/', '/register', '/forgot-password'].includes(currentPath)) {
            window.location.href = '/login?session=expired';
          }
        }
        (error as any).customMessage = 'Your session has expired. Please log in again.';
      } else {
        (error as any).customMessage = 'Please log in to continue.';
      }
      return Promise.reject(error);
    }

    // ✅ Fast path for 403
    if (status === 403) {
      const isMaintenance = errorData?.maintenance || 
                           (typeof errorData?.message === 'string' && 
                            errorData.message.toLowerCase().includes('maintenance'));
      
      if (isMaintenance) {
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath !== '/maintenance') {
            window.location.href = '/maintenance';
          }
        }
        (error as any).customMessage = 'System is currently under maintenance.';
      } else {
        (error as any).customMessage = 'You do not have permission to perform this action.';
      }
      return Promise.reject(error);
    }
    
    // ✅ Fast path for network errors
    if (!error.response) {
      let customMessage = 'Network error. Please check your connection.';
      if (error.code === 'ECONNABORTED') {
        customMessage = 'Request timed out. Please try again.';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        customMessage = 'Unable to connect to the server. Please try again later.';
      }
      (error as any).customMessage = customMessage;
      (error as any).type = 'network';
      return Promise.reject(error);
    }

    // ✅ Fast path for server errors
    if (status && status >= 500) {
      (error as any).customMessage = 'Server error. Please try again later.';
      (error as any).type = 'server';
    } else if (status === 404) {
      (error as any).customMessage = 'Resource not found.';
    } else if (status === 400) {
      (error as any).customMessage = userMessage || 'Invalid request. Please check your input.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper functions
export const canEditUsers = (role: string) => role === 'SUPER_ADMIN';
export const canCreateUsers = (role: string) => role === 'SUPER_ADMIN' || role === 'CLASS_REP';
export const canAssignDepartments = (role: string) => role === 'SUPER_ADMIN';
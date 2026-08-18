// lib/api/client.ts
// Canonical axios client for frontend

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const isBrowser = typeof window !== 'undefined';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (isBrowser ? '/api' : 'http://localhost:3001')).replace(/\/$/, '');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor � attach Authorization header from localStorage if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isBrowser) {
      try {
        const token = localStorage.getItem('src_token');
        if (token && token !== 'null' && token !== 'undefined' && config.headers) {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore localStorage errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor � dispatch global event on 401 so AuthProvider handles logout/navigation
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && isBrowser && !url.includes('/auth/login')) {
      try { window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { url } })); } catch {}
    }
    return Promise.reject(error);
  },
);

export default apiClient;

export const canEditUsers = (role: string) => role === 'SUPER_ADMIN';
export const canCreateUsers = (role: string) => role === 'SUPER_ADMIN' || role === 'CLASS_REP';
export const canAssignDepartments = (role: string) => role === 'SUPER_ADMIN';

export const getErrorMessage = (errorData: any): string => {
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
  if (typeof errorData === 'string') return errorData;
  if (typeof errorData.error === 'string') return errorData.error;
  if (typeof errorData.statusCode === 'number') {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Please log in to continue.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'The request conflicts with existing data.',
      422: 'The submitted data is invalid.',
      500: 'Server error. Please try again later.',
    };
    return messages[errorData.statusCode] || `Request failed with status ${errorData.statusCode}.`;
  }
  return 'An unexpected error occurred.';
};


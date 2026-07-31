import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR: Automatically attach Bearer token if present
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

// 2. RESPONSE INTERCEPTOR: Single consolidated error and success handler
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[apiClient SUCCESS ${response.status}] ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const path = error.config?.url;
    const hasAuthHeader = !!error.config?.headers?.Authorization;
    const errorData: any = error.response?.data;
    const errorMessage = (errorData?.message || '').toLowerCase();
    
    const isMaintenance = Boolean(errorData?.maintenance) || errorMessage.includes('maintenance');

    console.error(`[apiClient RESPONSE ERROR ${status || 'NETWORK'}] Path: ${path}`);

    if (status === 401) {
      if (hasAuthHeader) {
        console.warn('[apiClient 401] Bearer token rejected or expired by NestJS. Purging session.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('src_user');
          localStorage.removeItem('src_token');
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      } else {
        console.warn(`[apiClient 401] Request to ${path} reached backend without an Authorization header.`);
      }
    }

   if (status === 403) {
      if (isMaintenance) {
        console.warn('[apiClient 403] System is under maintenance. Redirecting to maintenance view.');
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // Allow redirection to maintenance even from login/home if maintenance is active
          if (currentPath !== '/maintenance') {
            window.location.href = '/maintenance';
          }
        }
      } else {
        console.warn('[apiClient 403] Access forbidden for current user role.');
        (error as any).customMessage = 'You do not have permission to perform this action.';
      }
    }
    
    if (!error.response) {
      let customMessage = 'Network error: Please check your connection';
      if (error.code === 'ECONNABORTED') {
        customMessage = 'Request timeout. The server is taking too long to respond.';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        customMessage = 'Unable to connect to NestJS backend on http://localhost:3001.';
      }
      console.error('[apiClient NETWORK FAILURE]:', customMessage);
      (error as any).customMessage = customMessage;
      (error as any).type = 'network';
    }

    if (status && status >= 500) {
      console.error('[apiClient 500+] Internal Server Error from NestJS');
      (error as any).customMessage = 'Server error. Please try again later.';
      (error as any).type = 'server';
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper functions
export const canEditUsers = (role: string) => role === 'SUPER_ADMIN';
export const canCreateUsers = (role: string) => role === 'SUPER_ADMIN' || role === 'CLASS_REP';
export const canAssignDepartments = (role: string) => role === 'SUPER_ADMIN';
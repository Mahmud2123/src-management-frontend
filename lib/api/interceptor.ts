// lib/api/interceptor.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

<<<<<<< HEAD
export const apiClient = axios.create({
  baseURL: '/api', // Use relative path for proxy
=======
// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< HEAD
// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
=======
// Request interceptor - Attach JWT token to all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
    const token = typeof window !== 'undefined' ? localStorage.getItem('src_token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
<<<<<<< HEAD
    console.error('Request configuration error:', error.message);
=======
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
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
        if (!window.location.pathname === '/') {
          window.location.href = '/';
=======
// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('src_user');
        localStorage.removeItem('src_token');
        
        // Redirect to auth page if not already there
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
        }
      }
    }

<<<<<<< HEAD
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      (error as any).customMessage = 'You do not have permission to perform this action.';
=======
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access denied: Insufficient permissions');
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
    }

    // Handle network errors
    if (!error.response) {
<<<<<<< HEAD
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
=======
      console.error('Network error: Please check your connection');
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
    }

    return Promise.reject(error);
  }
);

export default apiClient;
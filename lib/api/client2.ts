import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const isBrowser = typeof window !== 'undefined';

const defaultApiBase = isBrowser ? '/api' : 'https://src-management-backend.onrender.com';
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || defaultApiBase).replace(/\/$/, '');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Authorization header from localStorage if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isBrowser) {
      try {
        const token = localStorage.getItem('src_token');
        if (token && token !== 'null' && token !== 'undefined' && config.headers) {
          (config.headers as any).Authorization = 'Bearer ' + token;
        }
      } catch {
        // ignore localStorage errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle auth and maintenance redirects
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const url = (error.config as any)?.url || '';

    if (status === 401 && isBrowser && !url.includes('/auth/login')) {
      try { window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { url } })); } catch {}
    }

    if (status === 503 && isBrowser) {
      try {
        // Notify app of maintenance state; DO NOT clear auth tokens (do not log out users).
        window.dispatchEvent(new CustomEvent('system:maintenance', { detail: { url } }));
        // Let the app decide how to show maintenance UI; by default redirect to /maintenance for non-admin views.
        // Do not remove localStorage tokens here — keep sessions intact.
        window.location.href = '/maintenance';
      } catch {}
    }

    return Promise.reject(error);
  },
);

export default apiClient;

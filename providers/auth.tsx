'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { loginAPI } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
=======
// Storage keys
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
const STORAGE_KEYS = {
  USER: 'src_user',
  TOKEN: 'src_token',
} as const;

<<<<<<< HEAD
=======
// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth/forgot-password', '/auth/reset-password'];

>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            
<<<<<<< HEAD
=======
            // Validate user object structure
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
            if (
              parsedUser &&
              typeof parsedUser === 'object' &&
              parsedUser.id &&
              parsedUser.email &&
              parsedUser.role
            ) {
              setUser(parsedUser);
              setToken(storedToken);
            } else {
<<<<<<< HEAD
=======
              // Invalid user structure, clear storage
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
              throw new Error('Invalid user data structure');
            }
          } catch (parseError) {
            console.warn('Failed to parse stored user data:', parseError);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth state:', err);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

<<<<<<< HEAD
  // Handle route protection after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const isLandingPage = pathname === '/';
    const isAuthRoute = pathname?.startsWith('/auth');
    const isPublicRoute = isLandingPage || isAuthRoute;

    // If authenticated and on public route -> go to dashboard
    if (user && isPublicRoute) {
      router.replace('/dashboard');
      return;
    }

    // If not authenticated and on protected route -> go to landing
    if (!user && !isPublicRoute) {
      router.replace('/');
      return;
    }
  }, [user, pathname, isInitialized, router]);
=======
// Handle route protection after initialization
useEffect(() => {
  if (!isInitialized) return;

  // FIX: Differentiate between the landing page and protected pages
  const isLandingPage = pathname === '/';
  const isAuthRoute = pathname?.startsWith('/auth');
  const isPublicRoute = isLandingPage || isAuthRoute;

  // 1. If authenticated and trying to access login/landing page -> Dashboard
  if (user && isPublicRoute) {
    console.log('Auth Guard: Redirecting logged-in user to dashboard');
    router.replace('/dashboard');
    return;
  }

  // 2. If NOT authenticated and trying to access a protected page -> Landing
  if (!user && !isPublicRoute) {
    console.log('Auth Guard: Redirecting guest to landing page');
    router.replace('/');
    return;
  }
}, [user, pathname, isInitialized, router]);
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await loginAPI(email, password);

      if (!res.user || !res.token) {
        throw new Error('Invalid response from server');
      }

<<<<<<< HEAD
      setUser(res.user);
      setToken(res.token);

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);

      // Success toast
=======
      // Update state
      setUser(res.user);
      setToken(res.token);

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);

>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
      toast.success('Welcome back!', {
        description: 'Redirecting to your dashboard...',
      });

<<<<<<< HEAD
      router.replace('/dashboard');
    } catch (err: any) {
      // Extract error message
      let errorMessage = 'Invalid email or password. Please try again.';
      
      // Check for network errors
      if (err.type === 'network' || err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } 
      // Check for 401 (invalid credentials)
      else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } 
      // Check for validation errors
      else if (err.response?.data) {
        const { message, error } = err.response.data;
        if (Array.isArray(message)) {
          errorMessage = message[0] || errorMessage;
        } else if (typeof message === 'string') {
          errorMessage = message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
      } 
      // Use custom message if available
      else if (err.customMessage) {
        errorMessage = err.customMessage;
      }

      // Show error toast ONLY - no inline error
=======
      // Use replace to prevent back button issues
      router.replace('/dashboard');
    } catch (err: any) {
      // Enhanced error handling for NestJS/Axios responses
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err.response?.data) {
        const { message, error } = err.response.data;
        
        // Handle validation errors (array of messages)
        if (Array.isArray(message)) {
          errorMessage = message[0];
        } 
        // Handle single error messages
        else if (typeof message === 'string') {
          errorMessage = message;
        }
        // Handle generic error property
        else if (typeof error === 'string') {
          errorMessage = error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
      toast.error('Login Failed', {
        description: errorMessage,
      });

<<<<<<< HEAD
      // Re-throw for component-level handling (but component won't show inline error)
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = err;
      throw enhancedError;
=======
      // Re-throw for component-level handling if needed
      throw new Error(errorMessage);
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
    }
  }, [router]);

  const logout = useCallback(() => {
<<<<<<< HEAD
    setUser(null);
    setToken(null);

=======
    // Clear state
    setUser(null);
    setToken(null);

    // Clear storage
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    toast.success('Signed out successfully', {
      description: 'Come back soon!',
    });

<<<<<<< HEAD
=======
    // Use replace to prevent back button issues
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
    router.replace('/');
  }, [router]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
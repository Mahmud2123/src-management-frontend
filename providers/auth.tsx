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

// Storage keys
const STORAGE_KEYS = {
  USER: 'src_user',
  TOKEN: 'src_token',
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth/forgot-password', '/auth/reset-password'];

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
            
            // Validate user object structure
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
              // Invalid user structure, clear storage
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

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await loginAPI(email, password);

      if (!res.user || !res.token) {
        throw new Error('Invalid response from server');
      }

      // Update state
      setUser(res.user);
      setToken(res.token);

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);

      toast.success('Welcome back!', {
        description: 'Redirecting to your dashboard...',
      });

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

      toast.error('Login Failed', {
        description: errorMessage,
      });

      // Re-throw for component-level handling if needed
      throw new Error(errorMessage);
    }
  }, [router]);

  const logout = useCallback(() => {
    // Clear state
    setUser(null);
    setToken(null);

    // Clear storage
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    toast.success('Signed out successfully', {
      description: 'Come back soon!',
    });

    // Use replace to prevent back button issues
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
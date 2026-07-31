"use client";

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

const STORAGE_KEYS = {
  USER: 'src_user',
  TOKEN: 'src_token',
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // 1. Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            
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

  // 2. Client-side route protection
 // 2. Client-side route protection
  useEffect(() => {
    if (!isInitialized) return;

    const isLandingPage = pathname === '/';
    const isAuthRoute = pathname?.startsWith('/auth') || pathname?.startsWith('/login');
    const isMaintenanceRoute = pathname === '/maintenance';
    const isPublicRoute = isLandingPage || isAuthRoute || isMaintenanceRoute;

    // If maintenance mode is active, allow everyone (auth or unauth) to view /maintenance peacefully
    if (isMaintenanceRoute) {
      // If an admin happens to hit /maintenance, send them back to dashboard
      if (user) {
        const normalizedRole = String(user.role || '').toUpperCase();
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(normalizedRole);
        if (isAdmin) {
          router.replace('/dashboard');
        }
      }
      return;
    }

    // Authenticated users on landing/auth routes -> go to dashboard
    if (user && isPublicRoute) {
      router.replace('/dashboard');
      return;
    }

    // Unauthenticated users on protected routes -> go to landing
    if (!user && !isPublicRoute) {
      router.replace('/');
      return;
    }
  }, [user, pathname, isInitialized, router]);

  // 3. Login method
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await loginAPI(email, password);

      if (!res.user || !res.token) {
        throw new Error('Invalid response from server');
      }

      setUser(res.user);
      setToken(res.token);

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
    } catch (err: any) {
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (err.type === 'network' || err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.response?.data) {
        const { message, error } = err.response.data;
        if (Array.isArray(message)) {
          errorMessage = message[0] || errorMessage;
        } else if (typeof message === 'string') {
          errorMessage = message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
      } else if (err.customMessage) {
        errorMessage = err.customMessage;
      }

      throw new Error(errorMessage);
    }
  }, []);

  // 4. Logout method
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    toast.success('Signed out successfully', {
      description: 'Come back soon!',
    });

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
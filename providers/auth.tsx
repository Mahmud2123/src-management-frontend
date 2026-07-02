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

  // Initialize auth state from localStorage
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


  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await loginAPI(email, password);

      if (!res.user || !res.token) {
        throw new Error('Invalid response from server');
      }

      toast.success('Welcome back!', {
        description: 'Redirecting to your dashboard...',
      });

      toast.error('Login Failed', {
        description: errorMessage,
      });

    }
  }, [router]);

  const logout = useCallback(() => {
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
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client2';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'src_token';
const USER_KEY = 'src_user';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(TOKEN_KEY);

  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }

  return token;
}

function clearAuthStorage() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  document.cookie =
    'src_token=; Path=/; Max-Age=0; SameSite=Lax';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = useCallback((data: any): User => {
    return {
      ...data,
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      level: data.level ?? null,
      studentStatus: data.studentStatus ?? null,
      studentId: data.studentId ?? null,
      phoneNumber: data.phoneNumber ?? null,
      // Use backend proxy redirect endpoint for avatars so frontend never directly references r2:// keys
      avatarUrl: data.avatarUrl ? `/api/files/users/${data.id}/avatar/redirect` : null,
      isActive: data.isActive ?? true,
      department: data.department ?? null,
    } as User;
  }, []);

  const saveUser = useCallback(
    (data: any) => {
      const normalized = normalizeUser(data);

      setUser(normalized);

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(normalized),
        );
      }

      return normalized;
    },
    [normalizeUser],
  );

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const token = getStoredToken();

      if (!token) {
        setUser(null);
        return null;
      }

      const response = await apiClient.get('/auth/me');

      if (!response.data) {
        clearAuthStorage();
        setUser(null);
        return null;
      }

      return saveUser(response.data);
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        // Session really is invalid — clear it and mark unauthenticated.
        clearAuthStorage();
        setUser(null);
      } else if (status === 404) {
        // /auth/me not found is a proxy/routing bug, not a logout. Surface it loudly
        // instead of silently signing the user out.
        if (process.env.NODE_ENV === 'development') {
          console.error(
            '[auth] GET /auth/me returned 404 — check next.config rewrites for /api/auth/* ' +
              'and that the Nest AuthController is mounted at /auth/me.',
          );
        }
      }
      // Network error / 5xx / anything else: leave existing auth state untouched —
      // a temporarily unreachable API is not the same thing as "logged out".

      return null;
    }
  }, [saveUser]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const token = getStoredToken();

        if (!token) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const storedUser = localStorage.getItem(USER_KEY);

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);

            if (parsed?.id && parsed?.email && mounted) {
              setUser(normalizeUser(parsed));
            }
          } catch {
            localStorage.removeItem(USER_KEY);
          }
        }

        await refreshUser();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [normalizeUser, refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiClient.post('/auth/login', {
          email,
          password,
        });

        const data = response.data;

        if (!data?.user || !data?.token) {
          throw new Error('Invalid response from server.');
        }

        const loggedInUser = saveUser(data.user);

        localStorage.setItem(TOKEN_KEY, data.token);

        /*
         * The backend already sets the HTTP-only cookie.
         * Keep this client cookie only for compatibility with
         * the existing middleware.
         */
        document.cookie =
          `src_token=${encodeURIComponent(data.token)}; Path=/; Max-Age=86400; SameSite=Lax`;

        toast.success('Welcome back!', {
          description: `Logged in as ${loggedInUser.name}`,
        });

        const params = new URLSearchParams(window.location.search);

        const requestedRedirect = params.get('redirect');

        const destination =
          requestedRedirect &&
          requestedRedirect.startsWith('/') &&
          !requestedRedirect.startsWith('//')
            ? requestedRedirect
            : '/dashboard';

        router.replace(destination);
      } catch (error: any) {
        let message =
          'Invalid email or password. Please try again.';

        const data = error?.response?.data;

        if (typeof data?.message === 'string') {
          message = data.message;
        } else if (Array.isArray(data?.message)) {
          message = data.message.join('. ');
        } else if (typeof data?.error === 'string') {
          message = data.error;
        } else if (error?.message) {
          message = error.message;
        }

        throw new Error(message);
      }
    },
    [router, saveUser],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue local logout even if backend is unavailable.
    }

    clearAuthStorage();
    setUser(null);

    toast.success('Signed out successfully');

    router.replace('/');
  }, [router]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
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
    throw new Error(
      'useAuth must be used within an AuthProvider',
    );
  }

  return context;
}
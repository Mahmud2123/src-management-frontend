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
    const avatarValue = data?.avatarUrl;
    const isValidAvatar = typeof avatarValue === 'string' && avatarValue.trim() && avatarValue !== '?' && avatarValue !== 'null' && avatarValue !== 'undefined';
    const directAvatar = isValidAvatar
      ? (avatarValue.startsWith('http://') || avatarValue.startsWith('https://') || avatarValue.startsWith('/uploads') || avatarValue.startsWith('uploads/')
          ? avatarValue
          : null)
      : null;

    // If avatar is a storage URI (r2://...) or a storage key, do not expose it directly to the browser.
    // Use the backend redirect endpoint to safely resolve or proxy the asset.
    const resolvedAvatar = directAvatar ?? (data?.id ? `/api/files/users/${data.id}/avatar/redirect` : null);

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
      avatarUrl: resolvedAvatar,
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
        // Map common HTTP failures to friendly, non-revealing messages.
        const status = error?.response?.status;

        if (status === 401) {
          throw new Error('Incorrect email or password. Please check your credentials and try again.');
        }

        if (status === 403) {
          // Backend may provide a reason, but keep message generic and helpful.
          throw new Error('Your account does not have access to sign in. Contact support if you believe this is in error.');
        }

        if (status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        }

        if (!error?.response) {
          // Network or CORS error (no response)
          throw new Error('Unable to connect to the server. Please check your network connection and try again.');
        }

        if (status >= 500) {
          throw new Error('Something went wrong on the server. Please try again later.');
        }

        // Fallback: don't surface raw backend messages in production — return a safe default.
        const data = error?.response?.data;
        let message = 'Login failed. Please try again.';
        if (typeof data?.message === 'string' && process.env.NODE_ENV !== 'production') {
          // In non-production, surface the backend message for debugging.
          message = data.message;
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
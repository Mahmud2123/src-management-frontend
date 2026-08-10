// providers/auth.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/api/interceptor";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "src_user",
  TOKEN: "src_token",
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const normalizeUser = useCallback((userData: any): User => {
    return {
      ...userData,
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      level: userData.level ?? null,
      studentStatus: userData.studentStatus ?? null,
      studentId: userData.studentId ?? null,
      phoneNumber: userData.phoneNumber ?? null,
      avatarUrl: userData.avatarUrl ?? null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      department: userData.department || null,
    } as User;
  }, []);

  const persistUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        setUser(null);
        return null;
      }

      const response = await apiClient.get("/auth/me");
      
      if (!response?.data) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        setUser(null);
        return null;
      }

      const freshUser = normalizeUser(response.data);
      persistUser(freshUser);
      return freshUser;
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        setUser(null);
        return null;
      }
      console.debug("Refresh user error:", error?.message);
      return null;
    }
  }, [normalizeUser, persistUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        toast.error('Session expired', {
          description: 'Please log in again to continue.',
          duration: 5000,
        });
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (!storedToken) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
              const normalizedUser = normalizeUser(parsedUser);
              if (mounted) {
                setUser(normalizedUser);
              }
            }
          } catch (error) {
            console.warn("Invalid stored user data:", error);
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        }

        await refreshUser();
      } catch (error) {
        console.error("Authentication initialization failed:", error);
        if (mounted) {
          setUser(null);
        }
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [normalizeUser, refreshUser]);

  // ✅ FIXED: Login function with proper error re-throwing
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const data = response.data;

      if (!data?.user || !data?.token) {
        throw new Error("Invalid response from server.");
      }

      const loggedInUser = normalizeUser(data.user);
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      document.cookie = `src_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      
      persistUser(loggedInUser);
      
      toast.success('Welcome back!', {
        description: `Logged in as ${loggedInUser.name}`,
      });

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (error: any) {
      // ✅ Extract meaningful error message
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join('. ');
        } else if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
      } else if (error?.customMessage) {
        errorMessage = error.customMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // ✅ Re-throw with user-friendly message
      throw new Error(errorMessage);
    }
  }, [normalizeUser, persistUser, router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    document.cookie = 'src_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    toast.success("Signed out successfully", { description: "Come back soon!" });
    router.replace("/");
  }, [router]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
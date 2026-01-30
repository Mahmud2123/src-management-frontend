// providers/auth.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { loginAPI } from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading:boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('src_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false); // 2. Finish loading
  }, []);

 // providers/auth.tsx

const login = async (email: string, password: string) => {
  try {
    const res = await loginAPI(email, password);
    setUser(res.user);
    localStorage.setItem('src_user', JSON.stringify(res.user));
    localStorage.setItem('src_token', res.token);
    toast.success('Welcome back!');
    router.push('/dashboard');
  } catch (err: any) {
    // 1. Extract the data from Axios response
    const backendData = err.response?.data;
    
    // 2. NestJS puts the error message in .message. 
    // ValidationPipe often returns an array of strings.
    let errorMessage = 'Authentication failed';
    
    if (backendData?.message) {
      errorMessage = Array.isArray(backendData.message) 
        ? backendData.message[0] // Show the first validation error
        : backendData.message;   // Show the string error (e.g. "Invalid credentials")
    } else if (err.message) {
      errorMessage = err.message;
    }

    toast.error(errorMessage);
    throw err; // Re-throw so the UI can also react if needed
  }
};
  const logout = () => {
    setUser(null);
    localStorage.removeItem('src_user');
    localStorage.removeItem('src_token');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};



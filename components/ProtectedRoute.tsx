// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import LoadingState from './LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0 && user) {
      const userRole = user.role?.toUpperCase();
      const hasRequiredRole = allowedRoles.some(
        role => role.toUpperCase() === userRole
      );
      
      if (!hasRequiredRole) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [loading, isAuthenticated, user, router, redirectTo, allowedRoles]);

  // Show loading state while checking auth
  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If roles are specified and user doesn't have required role
  if (allowedRoles.length > 0 && user) {
    const userRole = user.role?.toUpperCase();
    const hasRequiredRole = allowedRoles.some(
      role => role.toUpperCase() === userRole
    );
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}
'use client';

import { useAuth } from '@/providers/auth';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Shield } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Define public routes
  const PUBLIC_ROUTES = ['/', '/auth', '/auth/forgot-password', '/auth/reset-password'];
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname?.startsWith(route)
  );

  // Show loading screen during initial auth check
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-6 animate-pulse">
            <Shield className="w-11 h-11 text-green-700" strokeWidth={2.5} />
          </div>
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Loading SRC Portal...</p>
          <p className="text-green-200 text-sm mt-2">Please wait while we authenticate you</p>
        </div>
      </div>
    );
  }

  // Render public routes without sidebar
  if (isPublicRoute || !user) {
    return <>{children}</>;
  }

  // Render protected routes with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
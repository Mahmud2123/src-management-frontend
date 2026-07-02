'use client';

import { useAuth } from '@/providers/auth';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Shield } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname() || '';

  /**
   * FIX: We must distinguish between an EXACT match for the landing page
   * and a PREFIX match for auth routes.
   */
  const isLandingPage = pathname === '/';
  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicRoute = isLandingPage || isAuthRoute;

  // Debug logging - Monitor this in your browser console
  console.log('Layout Debug:', { 
    path: pathname, 
    isPublic: isPublicRoute, 
    hasUser: !!user 
  });

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-6 animate-pulse">
            <Shield className="w-11 h-11 text-green-700" strokeWidth={2.5} />
          </div>
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Loading SRC Portal...</p>
        </div>
      </div>
    );
  }

  // If it's a public page OR the user isn't logged in, skip the layout
  if (isPublicRoute || !user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Ensure your Sidebar component doesn't have 
          its own 'hidden' classes that might override this 
      */}
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-white dark:bg-gray-950">
        {children}
      </main>
    </div>
  );
}
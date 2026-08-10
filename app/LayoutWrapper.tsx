// app/LayoutWrapper.tsx - Update the logic
'use client';

import { useAuth } from '@/providers/auth';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Shield } from 'lucide-react';
import { UnauthorizedAccess } from '@/components/UnauthorizedAccess';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname() ?? '';

  const isAuthRoute = pathname.startsWith('/auth');
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';
  
  // Only show sidebar for authenticated users on dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/complaints') || 
                          pathname.startsWith('/profile') ||
                          pathname.startsWith('/announcements') ||
                          pathname.startsWith('/users') ||
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/statistics') ||
                          pathname.startsWith('/audit-logs') ||
                          pathname.startsWith('/moderation') ||
                          pathname.startsWith('/suggestions') ||
                          pathname.startsWith('/excos') ||
                          pathname.startsWith('/class-rep') ||
                          pathname.startsWith('/notifications');

  const shouldShowSidebar = user && !isAuthRoute && !isLoginPage && !isLandingPage;

  // Global Loading State
  if (loading) {
    return (
      <div 
        role="status" 
        aria-label="Loading session" 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-green-950 text-white"
      >
        <div className="flex flex-col items-center text-center p-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl mb-6 animate-pulse">
            <Shield className="w-10 h-10 text-green-400" strokeWidth={2.2} />
          </div>
          <div className="w-12 h-12 border-3 border-white/20 border-t-green-400 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium tracking-wide text-green-100/80">
            Initializing SRC Portal...
          </p>
          <p className="text-xs text-green-200/50 mt-2">
            Sa'adu Zungur University, Bauchi, Nigeria
          </p>
        </div>
      </div>
    );
  }

  // Check for deactivated users
  if (user && !user.isActive) {
    return <UnauthorizedAccess type="forbidden" message="Your account has been deactivated. Please contact support." />;
  }

  // Render with sidebar for authenticated users on dashboard routes
  if (shouldShowSidebar) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main 
          id="main-content" 
          className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-white focus:outline-none"
        >
          {children}
        </main>
      </div>
    );
  }

  // Public/Unauthenticated view (landing page, login, etc.)
  return <div className="min-h-screen w-full">{children}</div>;
}
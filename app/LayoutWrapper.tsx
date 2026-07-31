'use client';

import { useAuth } from '@/providers/auth';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Shield } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname() ?? '';

  const isLandingPage = pathname === '/';
  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicRoute = isLandingPage || isAuthRoute;

  // Global Loading State (Prevents layout flashing during session check)
  if (isLoading) {
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
        </div>
      </div>
    );
  }

  // Public/Unauthenticated View
  if (isPublicRoute || !user) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  // Authenticated Dashboard Layout
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
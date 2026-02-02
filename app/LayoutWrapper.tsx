'use client';

import { useAuth } from '@/providers/auth';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Shield } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Exact match for landing, startsWith for auth paths
  const isPublicRoute = pathname === '/' || pathname?.startsWith('/auth');

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 to-green-950">
        {/* Your Loading UI */}
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-white font-semibold">Loading SRC Portal...</p>
      </div>
    );
  }

  // If it's a public route OR we have no user, don't show the sidebar
  if (isPublicRoute || !user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      {/* Added h-full and overflow-y-auto to ensure scrolling works with the new dashboard */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
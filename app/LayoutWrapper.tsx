'use client';

import { useAuth } from '@/providers/auth';
import { usePathname, useRouter } from 'next/navigation'; // Add useRouter
import { useEffect } from 'react'; // Add useEffect
import Sidebar from '@/components/Sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/' || pathname === '/register';

  // PROTECT ROUTES: If user is not logged in and tries to access a dashboard page
  useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      router.push('/'); // Force redirect to root (Auth) instead of /login
    }
  }, [user, isLoading, isAuthPage, router]);

  // Show a loading state so the user doesn't see a "flicker" of the dashboard
  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-white">Loading...</div>;
  }

  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
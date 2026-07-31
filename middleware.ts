import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/maintenance' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const res = await fetch(`${backendUrl}/settings`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const settings = await res.json();
      
      // If maintenance mode is active, you can optionally force a redirect 
      // for any page hits, and let client-side API requests handle role exemptions.
      if (settings.maintenanceMode && pathname !== '/maintenance') {
        // Let middleware forward; the client-side queries/guards 
        // will naturally receive 403 and hit the maintenance redirect if they aren't admin.
      }
    }
  } catch (error) {
    // Fail safe
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
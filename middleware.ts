// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-reset',
  '/maintenance',
  '/unauthorized',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('src_token')?.value;

  // Check if path is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes(':')) {
      const pattern = route.replace(/:path\*/, '.*');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // If public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('unauthorized', 'true');
    return NextResponse.redirect(loginUrl);
  }

  // For protected routes with token, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|json|woff|woff2|ttf|eot|otf|ico)).*)',
  ],
};
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-reset',
  '/maintenance',
];

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/complaints',
  '/complaints/create',
  '/complaints/:path*',
  '/announcements',
  '/users',
  '/settings',
  '/statistics',
  '/audit-logs',
  '/moderation',
  '/suggestions',
  '/excos',
  '/class-rep',
  '/notifications',
];

// Define admin-only routes
const adminRoutes = [
  '/users',
  '/settings',
  '/audit-logs',
  '/statistics',
  '/moderation',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Try to obtain token from cookie or Authorization header (Bearer)
  const cookieToken = request.cookies.get('src_token')?.value;
  const headerAuth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  const headerToken = headerAuth ? headerAuth.replace(/^Bearer\s+/i, '') : null;

  // Normalize tokens: treat '', 'null', 'undefined' as absent
  const normalize = (t?: string | null) => {
    if (!t) return null;
    const v = t.toString().trim();
    if (!v) return null;
    if (v.toLowerCase() === 'null' || v.toLowerCase() === 'undefined') return null;
    return v;
  };

  const token = normalize(cookieToken) || normalize(headerToken);

  // Check if the path is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes(':')) {
      // Handle dynamic routes like /complaints/:path*
      const pattern = route.replace(/:path\*/, '.*');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For protected routes with token, allow access (auth will be validated on client)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|json|woff|woff2|ttf|eot|otf)).*)',
  ],
};
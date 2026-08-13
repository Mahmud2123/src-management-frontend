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

  // For protected routes with token, allow access (further validation occurs on client/server APIs)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|json|woff|woff2|ttf|eot|otf|ico)).*)',
  ],
};
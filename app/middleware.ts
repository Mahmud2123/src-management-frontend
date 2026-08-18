import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never interfere with API requests.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Public application routes.
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

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  /*
   * Do not redirect based only on the presence/absence of
   * src_token here.
   *
   * Authentication is handled by the AuthProvider and the
   * protected page/server logic.
   */
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|json|woff|woff2|ttf|eot|otf|ico)$).*)',
  ],
};
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

export async function middleware(request: NextRequest) {
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
      const pattern = route.replace(/:path\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // If public route, allow access (but still guard maintenance page below)
  if (isPublicRoute && pathname !== '/maintenance') {
    return NextResponse.next();
  }

  // Determine backend API base for server-to-server calls (middleware runs on server)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://src-management-backend.onrender.com';

  // Fetch maintenance status (cache for short time by module-level variable)
  try {
    const statusRes = await fetch(`${API_BASE}/settings/public`, { cache: 'no-store' });
    if (statusRes.ok) {
      const data = await statusRes.json();
      const maintenance = !!data?.maintenanceMode;
      if (!maintenance) {
        // not in maintenance — proceed as normal
        // If login page requested and user has token, allow (login flow may redirect)
        return NextResponse.next();
      }

      // In maintenance mode
      // Allow the maintenance page itself
      if (pathname === '/maintenance') {
        return NextResponse.next();
      }

      // Admin UI paths that should be accessible to admins during maintenance
      const adminUiPaths = ['/admin', '/settings', '/users', '/audit-logs', '/excos'];
      if (adminUiPaths.some(p => pathname.startsWith(p)) || pathname.startsWith('/api/admin') || pathname.startsWith('/api/settings')) {
        if (!token) {
          // no token — redirect to maintenance (clear cookie as a precaution)
          const res = NextResponse.redirect(new URL('/maintenance', request.url));
          res.headers.set('set-cookie', 'src_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
          return res;
        }

        // Verify token with backend verify-admin endpoint
        try {
          const verifyRes = await fetch(`${API_BASE}/auth/verify-admin`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          if (verifyRes.ok) {
            const body = await verifyRes.json();
            if (body?.isAdmin) {
              return NextResponse.next();
            }
          }
        } catch (e) {
          // ignore and fall through to redirect
          console.warn('verify-admin request failed', e);
        }

        const res = NextResponse.redirect(new URL('/maintenance', request.url));
        res.headers.set('set-cookie', 'src_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
        return res;
      }

      // For all other routes (including '/', '/login', API routes), redirect to /maintenance and clear cookie
      const res = NextResponse.redirect(new URL('/maintenance', request.url));
      res.headers.set('set-cookie', 'src_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
      return res;
    }
  } catch (err) {
    // If status check fails, allow traffic to avoid accidental lockout. Log via console for debug.
    console.warn('Failed to fetch maintenance status:', err);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|json|woff|woff2|ttf|eot|otf|ico)).*)',
  ],
};

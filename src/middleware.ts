import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper para decodificar el token JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger solo rutas /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      // No autenticado, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const payload = parseJwt(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
      // No tiene rol admin/superadmin, redirigir a dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

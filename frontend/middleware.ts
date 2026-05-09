import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if we are trying to access a dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // In a real app, we should check if the JWT token is valid here or via a cookie.
    // Since localStorage is not accessible in edge middleware, and if we're not using cookies,
    // we have to rely on a client-side check or a cookie.
    // For now, let's just let it pass and let the layout/client handle the redirect if localStorage doesn't exist,
    // OR we can check for a cookie if we set one on login.
    // Let's assume the auth context already handles redirection to /login if no token is in localStorage.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

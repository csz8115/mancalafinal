import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;

  // Define public routes that don't require a session
  const publicPaths = ["/login", "/register", "/favicon.ico"];
  const { pathname } = request.nextUrl;

  // Skip check for public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If session cookie is missing, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise allow through
  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - /api/auth/* (auth endpoints)
         * - /login (login page)
         * - /_next/static (static files)
         * - /_next/image (image optimization files)
         * - /favicon.ico (favicon file)
         */
        '/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)',
    ],
};
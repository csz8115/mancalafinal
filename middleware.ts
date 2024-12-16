import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // Get the session cookie
    const session = request.cookies.get("session");

    // If the session cookie is not set, redirect to the login page
    if (!session) {
        return NextResponse.redirect("http://localhost:3000/login");
    }

    // Get the session payload
    const sessionId = session.value;

    // Get the session from the auth api route
    const response = await fetch("http://localhost:3000/api/auth", {
        headers: {
            cookie: `session=${sessionId}`,
        },
    });

    // If the session is not found, redirect to the login page
    if (!response.ok) {
        return NextResponse.redirect("http://localhost:3000/login");
    }

    // Continue to the next middleware
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
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from "@/utils/prisma";

export async function middleware(request: NextRequest) {
    const sessionId = request.cookies.get('sessionId')?.value;

    if (!sessionId) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Check if session exists in database
        const session = await prisma.session.findUnique({
            where: {
                sessionId,
            },
        });

        if (!session) {
            // Clear invalid session cookie and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('sessionId');
            return response;
        }

        // Check if session is expired
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
            // Clear expired session cookie and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('sessionId');
            return response;
        }

        // Valid session, continue to requested page
        return NextResponse.next();
    } catch (error) {
        console.error('Session verification error:', error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
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
        '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
    ],
};
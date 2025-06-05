"use server";
import { SignJWT, jwtVerify } from "jose";
import { Session } from "@/types/session-type";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not set');
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string, username: string, url: string) {
    // check if session exists in cookies
    if (await verifySession()) {
        return;
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const session = await encrypt({ userId, username, url, expiresAt });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        expires: expiresAt,
        secure: false, // set to true in production
        httpOnly: true,
        sameSite: "lax",
    });
}

export async function verifySession(): Promise<Session | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");
        if (!sessionCookie) {
            return null;
        }

        const session = await decrypt(sessionCookie.value);
        // check if session is expired
        if (new Date(session.expiresAt) < new Date()) {
            await deleteSession();
            return null;
        }

        // update the session's expiresAt date
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hr
        const refreshedSession = await encrypt(session);
        
        cookieStore.set("session", refreshedSession, {
            expires: session.expiresAt,
            secure: false, // set to true in production
            httpOnly: true,
            sameSite: "lax",
        });

        return session;
    } catch (error) {
        console.error("Error decrypting session:", error);
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

async function encrypt(payload: Session) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(payload.expiresAt)
        .sign(encodedKey);
}

export async function decrypt(token: string) {
    const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ["HS256"],
    });

    return payload as Session;
}
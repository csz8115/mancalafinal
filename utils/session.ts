"use server";
import { prisma } from "@/utils/prisma";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not set');
}
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
    userId: string;
    username: string;
    expiresAt: Date;
}

export async function createSession(userId: string, username: string) {
    // check if session exists in cookies
    if (await getSession()) {
        return;
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const session = await encrypt({ userId, username, expiresAt });

    (await cookies()).set("session", session, {
        expires: expiresAt,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
    });
    // save session to database if it doesn't exist
    await prisma.session.upsert({
        where: { userId },
        update: {},
        create: {
            sessionId: session,
            userId,
            username,
            expiresAt,
        },
    });
}

export async function deleteSession() {
    // delete session
    (await cookies()).delete("session");
}

export async function getSession() : Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
        return null;
    }

    try {
        const payload = await decrypt(session.value);
        return payload;
    } catch (e) {
        return null;
    }
}

async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(payload.expiresAt)
        .sign(encodedKey);
}

async function decrypt(token: string) {
    const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ["HS256"],
    });

    return payload as SessionPayload;
}
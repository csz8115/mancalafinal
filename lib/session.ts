"use server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { Session } from "@/types/session-type";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not set');
}
const encodedKey = new TextEncoder().encode(secretKey);

const profile_URLS = [
    "https://64.media.tumblr.com/7e8ded3b263d254cac5b00434ea60b40/353f4ef1923113d7-f9/s500x750/6be4c18a40062f0549954b4f049bc11290122aa9.png",
    "https://www.google.com/url?sa=i&url=https%3A%2F%2Fes.pinterest.com%2Fpin%2Ffuturama-bender-cartoon-profile-pics--187673509465519983%2F&psig=AOvVaw1gbe5Eg5X_bi9nHVkEQvmF&ust=1734972759367000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCODB0Krru4oDFQAAAAAdAAAAABAJ",
    "https://i.pinimg.com/736x/d4/fc/38/d4fc386b6dd407f8954f73cd742f7a97.jpg",
    "https://w0.peakpx.com/wallpaper/278/820/HD-wallpaper-rick-morty-rick-and-morty.jpg",
    "https://i.pinimg.com/originals/44/7c/7b/447c7bab41aecbf0131837f92feed893.jpg",
    "https://i.imgur.com/em88GAm.jpeg",
    // add more profile urls here
];

export async function createSession(userId: string, username: string) {
    // check if session exists in cookies
    if (await verifySession()) {
        return;
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const url = profile_URLS[Math.floor(Math.random() * profile_URLS.length)]; // random profile url
    const session = await encrypt({ userId, username, url, expiresAt });

    (await cookies()).set("session", session, {
        expires: expiresAt,
        secure: false, // set to true in production
        httpOnly: true,
        sameSite: "lax",
    });
}

export async function verifySession(): Promise<Session | null> {
    try {
        const sessionCookie = (await cookies()).get("session");
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
        session.expiresAt = new Date(Date.now() + 1000 * 60); // 1 hr
        await createSession(session.userId, session.username); // refresh session cookie

        return session;
    } catch (error) {
        console.error("Error decrypting session:", error);
        return null;
    }
}

export async function deleteSession() {
    // delete session
    (await cookies()).delete("session");
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
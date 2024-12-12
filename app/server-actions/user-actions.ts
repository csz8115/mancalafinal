'use server';

import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createSession, deleteSession } from "@/utils/session";

export async function createUser(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.User.create({
        data: {
        username,
        password: hashedPassword,
        },
    });
    return user;
}

export async function getUser(username: string) {
    return prisma.User.findUnique({
        where: {
            username,
        },
    });
}

export async function login(username: string, password: string) {
    const cookieStore = await cookies();
    const user = await getUser(username);
    if (!user) {
        throw new Error("Invalid login");
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
        throw new Error("Invalid login");
    }
    // Check if the user already has a session
    const session = await prisma.session.findFirst({
        where: {
            userId: username,
        },
    });
    // If the user already has a session, delete it
    if (session) {
        await deleteSession(session.sessionId);
    }
    // Create a new session if the user is authenticated
    const newSession = await createSession(username);
    

    // Set the session ID in the cookie
    cookieStore.set("sessionID", session.sessionId, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 60 * 60, // 1 hour
    });
    return user;
}

export async function register(username: string, password: string) {
    const user = await getUser(username);
    if (user) {
        throw new Error("User already exists");
    }
    return createUser(username, password);
}

export async function logout() {
    const cookieStore = await cookies();
    const sessionID = cookieStore.get("sessionID");
    if (!sessionID) {
        throw new Error("No session found");
    }
    await deleteSession(sessionID.value);
    cookieStore.delete("sessionID");
}

export async function checkSession() {
    const cookieStore = await cookies();
    const sessionID = cookieStore.get("sessionID");
    if (!sessionID) {
        return null;
    }
    return await prisma.session.findUnique({
        where: {
            sessionId: sessionID.value,
        },
    });
}




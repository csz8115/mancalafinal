"use server";
import db from "@/lib/db";
import { isPasswordValid } from "../utils";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginSchema, LoginState } from "@/types/login-types";
import { RegisterSchema, RegisterState } from "@/types/register-types";
import { ChatSchema, ChatState } from "@/types/chat-type";
import { GameFormSchema, GameFormState } from "@/types/game-type";
import { cookies } from 'next/headers';
import { decrypt } from "@/lib/session";

export async function login(_prevState: LoginState, formData: FormData): Promise<any> {
    const validatedFields = LoginSchema.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const user = await db.getUser(validatedFields.data.username);
    if (!user) {
        return { errors: { username: "User not found" } };
    }

    const checkPassword = await isPasswordValid(user.password, validatedFields.data.password);
    if (!checkPassword) {
        return { errors: { password: "Invalid password" } };
    }

    await createSession(user.id, user.username);
    // redirect to the home page
    return { success: true, user: user };
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}

export async function register(_prevState: RegisterState, formData: FormData): Promise<any> {
    const validatedFields = RegisterSchema.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    // Check if user already exists
    const existingUser = await db.getUser(validatedFields.data.username);
    if (existingUser) {
        return { errors: { username: "Username already exists" } };
    }

    // Create new user
    const newUser = await db.createUser(validatedFields.data.username, validatedFields.data.password);
    if (!newUser) {
        return { errors: "Failed to create user" };
    }

    redirect("/login");
}

export async function newMessage(_prevState: ChatState, formData: FormData): Promise<any> {
    const decryptedSession = await verifySession();
    
    if ('errors' in decryptedSession) {
        return decryptedSession;
    }

    const res = ChatSchema.safeParse(Object.fromEntries(formData));
    if (!res.success) {
        return { errors: res.error.flatten().fieldErrors };
    };
    console.log("Parsed message:", res.data);
    const message = res.data;

    if (!message.message || !decryptedSession.username || !decryptedSession.userId || !decryptedSession.url) {
        return { errors: "Missing required message fields" };
    }

    await db.createMessage(message.message, decryptedSession.username, decryptedSession.userId, decryptedSession.url);
}

export async function createGame(_prevState: GameFormState, formData: FormData): Promise<any> {
    const decryptedSession = await verifySession();
    
    if ('errors' in decryptedSession) {
        return decryptedSession;
    }
    
    const userId = decryptedSession.userId;
    const username = decryptedSession.username;

    const gameName = formData.get("lobbyName") as string;
    const gameMode = formData.get("gameMode") as string;

    const validatedFields = GameFormSchema.safeParse({
        lobbyName: gameName,
        gameMode: gameMode,
    });
    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    console.log(`Creating game: ${gameName} with mode: ${gameMode} for user: ${username}`);
    await db.createGame(userId, gameName.replace(/\s+/g, '-'));
    console.log(`Game created successfully: ${gameName} with mode: ${gameMode} for user: ${username}`);
    redirect(`/game?createGame=true&lobbyName=${gameName.replace(/\s+/g, '-')}`); // Redirect to the game page after creation
}

export async function joinGame(lobbyName: string): Promise<any> {
        const decryptedSession = await verifySession();
    
    if ('errors' in decryptedSession) {
        return decryptedSession;
    }
    
    const userId = decryptedSession.userId;

    // Validate lobbyName
    if (!lobbyName || typeof lobbyName !== 'string') {
        return { errors: { lobbyName: "Invalid lobby name" } };
    }

    console.log(`User ${decryptedSession.username} with ID ${userId} is attempting to join game${lobbyName}.`);
    await db.joinGame(userId, lobbyName.replace(/\s+/g, '-'));
    console.log(`User ${decryptedSession.username} with ID ${userId} joined game: ${lobbyName}`);
    redirect(`/game?createGame=false&lobbyName=${lobbyName.replace(/\s+/g, '-')}`); // Redirect to the game page after joining
}

async function verifySession() {
    const cookieStore = cookies();
    const session = (await cookieStore).get("session");
    if (!session) {
        return { errors: { session: "Session not found. Please log in." } };
    }
    const decryptedSession = await decrypt(session.value);
    if (!decryptedSession) {
        return { errors: { session: "Invalid session. Please log in again." } };
    }
    return decryptedSession;
}
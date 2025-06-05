"use server";
import db from "@/lib/db";
import { isPasswordValid } from "../utils";
import { createSession, deleteSession, verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginSchema, LoginState } from "@/types/login-types";
import { RegisterSchema, RegisterState } from "@/types/register-types";
import { ChatSchema, ChatState } from "@/types/chat-type";
import { GameFormSchema, GameFormState } from "@/types/game-type";

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
    const validatedFields = LoginSchema.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        return {
            errors: {
                username: fieldErrors.username,
                password: fieldErrors.password
            }
        };
    }

    const user = await db.getUser(validatedFields.data.username);
    if (!user) {
        return { errors: { username: ["User not found"] } };
    }

    const checkPassword = await isPasswordValid(user.password, validatedFields.data.password);
    if (!checkPassword) {
        return { errors: { password: ["Invalid password"] } };
    }

    await createSession(user.id, user.username, user.url || "https://api.dicebear.com/5.x/initials/svg?seed=default");
    const updatedUser = await db.updateUserLastLogin(user.id);
    // redirect to the home page
    return { success: true, user: updatedUser || undefined};
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}

export async function register(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
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
        return { errors: { username: ["Username already exists"] } };
    }

    // Create new user
    const newUser = await db.createUser(validatedFields.data.username, validatedFields.data.password);
    if (!newUser) {
        return { errors: { username: ["Failed to create user"] } };
    }

    redirect("/login");
}

export async function newMessage(_prevState: ChatState, formData: FormData): Promise<ChatState> {
    const decryptedSession = await verifySession();

    if (!decryptedSession) { 
        return { errors: { message: ["Session expired or invalid"] } };
    }

    const res = ChatSchema.safeParse(Object.fromEntries(formData));
    if (!res.success) {
        return { errors: res.error.flatten().fieldErrors };
    };
    console.log("Parsed message:", res.data);
    const message = res.data;

    if (!message.message || !decryptedSession?.username || !decryptedSession.userId || !decryptedSession.url) {
        return { errors: { message: ["Missing required message fields"] } };
    }

    await db.createMessage(message.message, decryptedSession.username, decryptedSession.userId, decryptedSession.url);
}

export async function createGame(_prevState: GameFormState, formData: FormData): Promise<GameFormState> {
    const decryptedSession = await verifySession();

    if (!decryptedSession) { 
        return { errors: { lobbyName: ["Session expired or invalid"] } };
    }

    const userId = decryptedSession?.userId;
    const username = decryptedSession?.username;

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

export async function joinGame(lobbyName: string): Promise<boolean | { errors: { lobbyName: string; }; }> {
    const decryptedSession = await verifySession();

    if (!decryptedSession) { 
        return { errors: { lobbyName: "Session expired or invalid" } };
    }


    const userId = decryptedSession?.userId;

    // Validate lobbyName
    if (!lobbyName || typeof lobbyName !== 'string') {
        return { errors: { lobbyName: "Invalid lobby name" } };
    }

    console.log(`User ${decryptedSession?.username} with ID ${userId} is attempting to join game${lobbyName}.`);
    await db.joinGame(userId, lobbyName.replace(/\s+/g, '-'));
    console.log(`User ${decryptedSession?.username} with ID ${userId} joined game: ${lobbyName}`);
    redirect(`/game?createGame=false&lobbyName=${lobbyName.replace(/\s+/g, '-')}`); // Redirect to the game page after joining
}
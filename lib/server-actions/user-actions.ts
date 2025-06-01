"use server";
import { getUser, createUser, createMessage } from "@/lib/db";
import { isPasswordValid } from "../utils";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginSchema, LoginState } from "@/types/login-types";
import { RegisterSchema, RegisterState } from "@/types/register-types";
import { ChatSchema, ChatState } from "@/types/chat-type";


export async function login(_prevState: LoginState, formData: FormData): Promise<any> {
    const validatedFields = LoginSchema.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    });
    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const user = await getUser(validatedFields.data.username);
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
    const existingUser = await getUser(validatedFields.data.username);
    if (existingUser) {
        return { errors: { username: "Username already exists" } };
    }

    // Create new user
    const newUser = await createUser(validatedFields.data.username, validatedFields.data.password);
    if (!newUser) {
        return { errors: "Failed to create user" };
    }

    redirect("/login");
}

export async function newMessage(_prevState: ChatState, formData: FormData): Promise<any> {
    const res = ChatSchema.safeParse(Object.fromEntries(formData));
    if (!res.success) {
        return { errors: res.error.flatten().fieldErrors };
    };
    console.log("Parsed message:", res.data);
    const message = res.data;

    if (!message.message || !message.username || !message.userId || !message.url) {
        return { errors: "Missing required message fields" };
    }

    await createMessage(message.message, message.username, message.userId, message.url);
}
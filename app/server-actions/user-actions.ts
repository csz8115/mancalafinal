"use server";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession} from "@/utils/session";
import { z } from "zod";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
    console.log("login action");
    const res = loginSchema.safeParse(Object.fromEntries(formData));
    if (!res.success) {
        return { error: res.error.flatten().fieldErrors };
    };

    const { username, password } = res.data;

    const user = await getUser(username);

    if (!user) {
        return { error: "Invalid username or password" };
    }

    // Compare the password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return { error: "Invalid username or password" };
    }

    console.log("creating session");
    await createSession(user.id, username);

    redirect("/dashboard");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}

export async function register(username: string, password: string) {
    const user = await createUser(username, password);
    await createSession(user.id, user.username);
    redirect("/dashboard");
}

export async function newMessage(prevState: any, formData: FormData) {
    const res = messageSchema.safeParse(Object.fromEntries(formData));
    if (!res.success) {
        return { error: res.error.flatten().fieldErrors };
    };
    const message = res.data.message;
    await createMessage(message);
    // 
}

async function createMessage(message: string) {
    // retrieve session
    const session = await getSession();
    if (!session) {
        return { error: "Unauthorized" };
    }
    // create message in database
    console.log(`Creating message: ${message}`);
    await prisma.chat.create({
        data: {
            username: session.username,
            message,
            userId: session.userId,
        },
    });
    // send message to all clients with socket.io

}

async function createUser(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });
    return user;
}

async function getUser(username: string) {
    return prisma.user.findUnique({
        where: {
            username,
        },
    });
}

const loginSchema = z.object({
    username: z.string().nonempty().min(4).max(20).trim(),
    password: z.string().nonempty().min(8).max(50).trim(),
});

const messageSchema = z.object({
    message: z.string().nonempty().min(1).max(255).trim(),
});
"use server";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession } from "@/utils/session";
import { z } from "zod";
import { redirect } from "next/navigation";
import { User } from "@/types/user-type";

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

export async function register(prevState: any, formData: FormData) {
    const res = registerSchema.safeParse(Object.fromEntries(formData));
    if (!res.success) {
        return { error: res.error.flatten().fieldErrors };
    };

    const { username, password } = res.data;

    const user = await getUser(username);

    if (user) {
        return { error: "Username already exists" };
    }

    await createUser(username, password);

    // login the user
    await login(prevState, formData);
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
            url: session.url,
        },
    });

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

export async function getUser(username: string): Promise<User | null> {
    const user = prisma.user.findUnique({
        where: {
            username,
        },
    });

    return user as Promise<User | null>;
}

export async function createGame() {
    // retrieve session
    const session = await getSession();
    if (!session) {
        return { error: "Unauthorized" };
    }
    // create game in database
    console.log(`Creating game for user: ${session.username}`);
    const game = await prisma.game.create({
        data: {
            player1: session.username,
            player2: "Waiting for player",
        },
    });

    return game;
}

export async function getGames() {
    const games = await prisma.game.findMany();
    return games;
}

export async function joinGame() {
    // retrieve session
    const session = await getSession();
    if (!session) {
        return { error: "Unauthorized" };
    }
    // find a game that is waiting for a player
    const game = await prisma.game.findFirst({
        where: {
            player2: "Waiting for player",
        },
    });

    if (!game) {
        return { error: "No games available" };
    }

    // update the game with the second player
    console.log(`Joining game ${game.id}`);
    await prisma.game.update({
        where: {
            id: game.id,
        },
        data: {
            player2: session.username,
        },
    });
    // redirect to the game page
    redirect(`/game/${game.id}`);
}

const loginSchema = z.object({
    username: z.string()
        .nonempty("Username cannot be blank")
        .min(4, "Username must be at least 4 characters")
        .max(20, "Username cannot exceed 20 characters")
        .trim(),
    password: z.string()
        .nonempty("Password cannot be blank")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password cannot exceed 50 characters")
        .trim(),
});

const registerSchema = z.object({
    username: z.string()
    .nonempty("username cannot be blank")
    .min(4, "Username must be at least 4 Characters")
    .max(20, "Username cannot exceed 20 Characters")
    .regex(
        /^[\x20-\x7E\s]*$/,
        "Only printable characters are allowed"
    )
    .trim(),
    password: z.string()
    .nonempty("password cannot be blank")
    .min(8, "password must be at least 4 Characters")
    .max(50, "Password cannot exceed 50 Characters")
    .regex(
        /^[\x20-\x7E\s]*$/,
        "Only printable characters are allowed"
    )
    .trim(),
    confirmPassword: z.string()
    .nonempty("confirm password cannot be blank")
    .min(8)
    .max(50)
    .trim(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const messageSchema = z.object({
    message: z.string()
        .nonempty("Message cannot be blank")
        .min(1, "Message must be at least 1 character")
        .max(255, "Message cannot exceed 255 characters")
        .regex(
            /^[\x20-\x7E\s]*$/,
            "Only printable characters are allowed"
        )
        .trim()
        // Prevent HTML/script injection
        .refine(
            msg => !/<[^>]*>/.test(msg),
            "HTML tags are not allowed"
        )
        // Prevent null bytes
        .refine(
            msg => !msg.includes('\0'),
            "Invalid characters detected"
        )
});
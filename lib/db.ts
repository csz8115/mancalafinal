import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

type Message = {
    username: string;
    message: string;
    userId: string;
    url: string;
};

export async function getUser(username: string): Promise<User | null> {
    const user = prisma.user.findUnique({
        where: {
            username,
        },
    });

    return user as Promise<User | null>;
}

export async function createGame(player1: string, player2: string) {
    const game = await prisma.game.create({
        data: {
            player1: player1,
            player2: player2,
        },
    });

    return game;
}

export async function createMessage(message: string, username: string, userId: string, url: string) {
    // create message in db
    console.log(`Creating message: ${message}`);
    await prisma.chat.create({
        data: {
            username: username,
            message: message,
            userId: userId,
            url: url,
        },
    });
}

export async function createUser(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            url: `https://api.dicebear.com/5.x/bottts-neutral/svg?seed=${username}`,
        },
    });
    return user;
}

export async function getGames() {
    const games = await prisma.game.findMany();
    return games;
}
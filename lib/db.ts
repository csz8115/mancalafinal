import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { join } from "path";

async function getUser(username: string): Promise<User | null> {
    const user = prisma.user.findUnique({
        where: {
            username,
        },
    });

    return user as Promise<User | null>;
}

async function createGame(player1ID: string, lobbyName: string) {
    const game = await prisma.game.create({
        data: {
            lobbyName: lobbyName,
            player1User: {
                connect: { id: player1ID },
            },
            player2User: undefined,
        },
    });

    return game;
}

async function joinGame(player2ID: string, lobbyName: string) {
    try {
        const game = await prisma.game.update({
            where: {
                lobbyName: lobbyName,
            },
            data: {
                player2User: {
                    connect: { id: player2ID },
                },
                status: 'inProgress',
            },
        });

        return game;
    } catch (error) {
        console.error('Error joining game:', error);
        throw error;
    }
}

async function createMessage(message: string, username: string, userId: string, url: string) {
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

async function createUser(username: string, password: string) {
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

async function getGames() {
    const games = await prisma.game.findMany();
    return games;
}

const db = {
    getUser,
    createGame,
    createMessage,
    createUser,
    getGames,
    joinGame,
};

export default db;
"use server";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession } from "@/utils/session";
import { z } from "zod";
import { redirect } from "next/navigation";
import { User } from "@/types/user-type";

export async function login(prevState: unknown, formData: FormData) {
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

export async function register(prevState: unknown, formData: FormData) {
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

export async function newMessage(prevState: unknown, formData: FormData) {
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
            player1: session.userId,
            player2: session.userId,
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
            status: "waiting",
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
            player2: session.userId,
        },
    });
    // redirect to the game page
    redirect(`/game?lobby=${game.id}`);
}

export async function makeMove(gameId: string, row: number, pit: number) {
    // retrieve session
    const session = await getSession();
    if (!session) {
        return { error: "Unauthorized" };
    }
    // retrieve the game
    const game = await prisma.game.findUnique({
        where: {
            id: gameId,
        },
    });

    if (!game) {
        return { error: "Game not found" };
    }

    // check if it's the player's turn
    if (game.current !== game.status) {
        return { error: "Not your turn" };
    }

    // make the move
    console.log(`Making move in game ${game.id}`);
    console.log(`clicked pit ${pit} in row ${row}`);

    // create a new board 2d array with the 1d array from the database
    // Create a new 2D board array from the 1D array
    const newBoard = [];
    for (let i = 0; i < 2; i++) {
        const row = [];
        for (let j = 0; j < 6; j++) {
            row.push(game.board[i * 6 + j]);
        }
        newBoard.push(row);
    }

    console.log(newBoard);

    // check if the move is valid
    if (newBoard[row][pit] === 0) {
        return { error: "Invalid move" };
    }

    // update the board with the move
    let stones = newBoard[row][pit];
    newBoard[row][pit] = 0;
    let currentRow = row;
    let currentPit = pit;

    // going counter-clockwise, drop one stone in each pit and stores
    while (stones > 0) {
        if (currentRow === 1 && currentPit === 0) {
            currentRow = 2;
            currentPit = 0;
            if (game.current === "player2") {
                // Only drop in store if it's player 2's turn
                newBoard[0][0] += 1;
                stones--;
            }
            continue;
        } else if (currentRow === 2 && currentPit === 5) {
            currentRow = 1;
            currentPit = 5;
            if (game.current === "player1") {
                // Only drop in store if it's player 1's turn
                newBoard[3][0] += 1;
                stones--;
            }
            continue;
        } else if (currentRow === 1) {
            currentPit -= 1;
            newBoard[currentRow][currentPit] += 1;
        } else if (currentRow === 2) {
            currentPit += 1;
            newBoard[currentRow][currentPit] += 1;
        }

        // Check if last stone landed in an empty pit
        if (stones === 1) {
            if (game.current === "player1" && currentRow === 2 && newBoard[currentRow][currentPit] === 1) {
                // Capture stones for player 1
                newBoard[3][0] += newBoard[1][currentPit] + 1;
                newBoard[1][currentPit] = 0;
                newBoard[2][currentPit] = 0;
            } else if (game.current === "player2" && currentRow === 1 && newBoard[currentRow][currentPit] === 1) {
                // Capture stones for player 2
                newBoard[0][0] += newBoard[2][currentPit] + 1;
                newBoard[2][currentPit] = 0;
                newBoard[1][currentPit] = 0;
            }
        }

        stones--;
    }

    // turn board back into 1D array
    const newBoard1D = [];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 6; j++) {
            newBoard1D.push(newBoard[i][j]);
        }
    }

    // update the game
    await prisma.game.update({
        where: {
            id: gameId,
        },
        data: {
            board: {
                set: newBoard1D,
            },
        },
    });

    // check if the game is over and update the status
    const player1Stones = newBoard[1].reduce((acc, val) => acc + val, 0);
    const player2Stones = newBoard[2].reduce((acc, val) => acc + val, 0);

    if (player1Stones === 0 || player2Stones === 0) {
        // game is over
        newBoard[0][0] += player2Stones;
        newBoard[3][0] += player1Stones;

        // update the status
        let status = "player1";
        if (newBoard[3][0] > newBoard[0][0]) {
            status = "player1";
        } else if (newBoard[0][0] > newBoard[3][0]) {
            status = "player2";
        } else {
            status = "draw";
        }

        await prisma.game.update({
            where: {
                id: gameId,
            },
            data: {
                status,
            },
        });
    }
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
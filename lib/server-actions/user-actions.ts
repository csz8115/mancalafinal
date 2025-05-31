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
    // 
}

// export async function joinGame() {
//     // retrieve session
//     const session = await verifySession();
//     if (!session) {
//         return { error: "Unauthorized" };
//     }
//     // find a game that is waiting for a player
//     const game = await prisma.game.findFirst({
//         where: {
//             status: "waiting",
//         },
//     });

//     if (!game) {
//         return { error: "No games available" };
//     }

//     // update the game with the second player
//     console.log(`Joining game ${game.id}`);
//     await prisma.game.update({
//         where: {
//             id: game.id,
//         },
//         data: {
//             player2: session.userId,
//         },
//     });
//     // redirect to the game page
//     redirect(`/game?lobby=${game.id}`);
// }

// export async function makeMove(gameId: string, row: number, pit: number) {
//     // retrieve session
//     const session = await verifySession();
//     if (!session) {
//         return { error: "Unauthorized" };
//     }
//     // retrieve the game
//     const game = await prisma.game.findUnique({
//         where: {
//             id: gameId,
//         },
//     });

//     if (!game) {
//         return { error: "Game not found" };
//     }

//     // check if it's the player's turn
//     if (game.current !== game.status) {
//         return { error: "Not your turn" };
//     }

//     // make the move
//     console.log(`Making move in game ${game.id}`);
//     console.log(`clicked pit ${pit} in row ${row}`);

//     // create a new board 2d array with the 1d array from the database
//     // Create a new 2D board array from the 1D array
//     const newBoard = [];
//     for (let i = 0; i < 2; i++) {
//         const row = [];
//         for (let j = 0; j < 6; j++) {
//             row.push(game.board[i * 6 + j]);
//         }
//         newBoard.push(row);
//     }

//     console.log(newBoard);

//     // check if the move is valid
//     if (newBoard[row][pit] === 0) {
//         return { error: "Invalid move" };
//     }

//     // update the board with the move
//     let stones = newBoard[row][pit];
//     newBoard[row][pit] = 0;
//     let currentRow = row;
//     let currentPit = pit;

//     // going counter-clockwise, drop one stone in each pit and stores
//     while (stones > 0) {
//         if (currentRow === 1 && currentPit === 0) {
//             currentRow = 2;
//             currentPit = 0;
//             if (game.current === "player2") {
//                 // Only drop in store if it's player 2's turn
//                 newBoard[0][0] += 1;
//                 stones--;
//             }
//             continue;
//         } else if (currentRow === 2 && currentPit === 5) {
//             currentRow = 1;
//             currentPit = 5;
//             if (game.current === "player1") {
//                 // Only drop in store if it's player 1's turn
//                 newBoard[3][0] += 1;
//                 stones--;
//             }
//             continue;
//         } else if (currentRow === 1) {
//             currentPit -= 1;
//             newBoard[currentRow][currentPit] += 1;
//         } else if (currentRow === 2) {
//             currentPit += 1;
//             newBoard[currentRow][currentPit] += 1;
//         }

//         // Check if last stone landed in an empty pit
//         if (stones === 1) {
//             if (game.current === "player1" && currentRow === 2 && newBoard[currentRow][currentPit] === 1) {
//                 // Capture stones for player 1
//                 newBoard[3][0] += newBoard[1][currentPit] + 1;
//                 newBoard[1][currentPit] = 0;
//                 newBoard[2][currentPit] = 0;
//             } else if (game.current === "player2" && currentRow === 1 && newBoard[currentRow][currentPit] === 1) {
//                 // Capture stones for player 2
//                 newBoard[0][0] += newBoard[2][currentPit] + 1;
//                 newBoard[2][currentPit] = 0;
//                 newBoard[1][currentPit] = 0;
//             }
//         }

//         stones--;
//     }

//     // turn board back into 1D array
//     const newBoard1D = [];
//     for (let i = 0; i < 2; i++) {
//         for (let j = 0; j < 6; j++) {
//             newBoard1D.push(newBoard[i][j]);
//         }
//     }

//     // update the game
//     await prisma.game.update({
//         where: {
//             id: gameId,
//         },
//         data: {
//             board: {
//                 set: newBoard1D,
//             },
//         },
//     });

//     // check if the game is over and update the status
//     const player1Stones = newBoard[1].reduce((acc, val) => acc + val, 0);
//     const player2Stones = newBoard[2].reduce((acc, val) => acc + val, 0);

//     if (player1Stones === 0 || player2Stones === 0) {
//         // game is over
//         newBoard[0][0] += player2Stones;
//         newBoard[3][0] += player1Stones;

//         // update the status
//         let status = "player1";
//         if (newBoard[3][0] > newBoard[0][0]) {
//             status = "player1";
//         } else if (newBoard[0][0] > newBoard[3][0]) {
//             status = "player2";
//         } else {
//             status = "draw";
//         }

//         await prisma.game.update({
//             where: {
//                 id: gameId,
//             },
//             data: {
//                 status,
//             },
//         });
//     }
// }
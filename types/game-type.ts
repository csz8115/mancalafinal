import { z } from "zod";

export type Game = {
    board: number[][];
    current: string;
    status: string;
    player1: string;
    player2: string;
}

export const GameFormSchema = z.object({
    lobbyName: z.string()
        .min(4, "Lobby name is required")
        .max(50, "Lobby name cannot exceed 50 characters")
        .regex(/^[a-zA-Z0-9\s]+$/, "Lobby name can only contain letters, numbers, and spaces")
        .trim(),
    gameMode: z.enum(["Singleplayer", "Online"], {
        errorMap: (issue, ctx) => {
            if (issue.code === "invalid_type") {
                return { message: "Game mode must be either Singleplayer or Online" };
            }
            return { message: ctx.defaultError };
        }
    })
});

export type GameFormState = {
    lobbyName?: string;
    gameMode?: "Singleplayer" | "Online";
    errors?: {
        lobbyName?: string[];
        gameMode?: string[];
    };
    message?: string
    sucess?: boolean;
} | undefined;
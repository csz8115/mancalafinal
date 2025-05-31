import { z } from "zod";

export type Chat = {
    message: string;
    createdAt?: Date;
    userId: string;
    username: string;
    url?: string;
};

export const ChatSchema = z.object({
    message: z.string()
        .nonempty("Message cannot be blank")
        .min(1, "Message must be at least 1 character")
        .max(255, "Message cannot exceed 255 characters")
        .trim(),
    userId: z.string().nonempty("User ID cannot be blank"),
    username: z.string().nonempty("Username cannot be blank"),
    url: z.string().url("Invalid URL format").optional(),
});

export type ChatState = | {
    errors?: {
        message?: string[]
        userId?: string[]
        username?: string[]
        url?: string[]
    },
    message?: string
}
    | undefined
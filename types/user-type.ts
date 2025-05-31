export type User = {
    id: string;
    username: string;
    password?: string;
    createdAt: Date;
    updatedAt?: Date;
    lastLogin?: Date;
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    gamesDrawn: number;
    url?: string; // Optional URL for user profile or avatar
}
import { User } from '@prisma/client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStore = {
    id: string | null;
    username: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    lastLogin?: Date | null;
    gamesPlayed?: number | null;
    gamesWon?: number | null;
    gamesLost?: number | null;
    gamesDrawn?: number | null;
    url?: string | null;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            id: null,
            username: null,
            createdAt: null,
            gamesPlayed: null,
            gamesWon: null,
            gamesLost: null,
            gamesDrawn: null,
            url: null,
            setUser: (user: User) => set({
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                gamesLost: user.gamesLost,
                gamesDrawn: user.gamesDrawn,
                url: user.url
            }),
            clearUser: () => set({
                id: null,
                username: null,
                createdAt: null,
                lastLogin: null,
                gamesPlayed: null,
                gamesWon: null,
                gamesLost: null,
                gamesDrawn: null,
                url: null
            })
        }),
        {
            name: 'user-storage',
        }
    )
);
import { User } from '@prisma/client';
import { url } from 'inspector';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStore = {
    id: string | null;
    username: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
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
            updatedAt: null,
            gamesPlayed: null,
            gamesWon: null,
            gamesLost: null,
            gamesDrawn: null,
            url: null,
            setUser: (user: User) => set({
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
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
                updatedAt: null,
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
"use client";
import { useSession } from "@/hooks/use-session";
import { getUser } from "../server-actions/user-actions";
import { useEffect, useState } from 'react';
import { User } from "@/types/user-type";
import GameBoard from "@/app/game/game-board";
import { Game } from "@/types/game-type";
import socket from "@/app/socket"

export default function Page() {
    const { session, loading } = useSession();
    const [game, setGame] = useState<Game | null>(null);


    async function socketInitializer() {
        if (session) {
            socket.on('game', (incomingGame: Game) => {
                console.log('Received game:', incomingGame)
                setGame(incomingGame);
            });
            socket.emit(`game-next-move`, (updatedGame: Game) => {

            });
            
        }
    }

    useEffect(() => {
        socketInitializer()
    }, []);


    return (
        <div className="flex flex-col items-center gap-4 mt-12">
            {game && <GameBoard game={game} />}
        </div>
    );
}
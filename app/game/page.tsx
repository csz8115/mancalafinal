"use client";
// import { getUser } from "../server-actions/user-actions";
import { useEffect, useState } from 'react';
// import { User } from "@/types/user-type";
import GameBoard from "@/app/game/game-board";
import { Game } from "@/types/game-type";
import socket from "@/app/socket"

export default function Page() {
    const [game, setGame] = useState<Game | null>(null);


    async function socketInitializer() {
        try {
            socket.on('game', (incomingGame: Game) => {
                console.log('Received game:', incomingGame)
                setGame(incomingGame);
            });
            // socket.emit(`game-next-move`, (updatedGame: Game) => {

            // });
        } catch (error) {
            console.error("Error initializing socket:", error);
        }
    }

    try {
        useEffect(() => {
            socketInitializer();
        }
            , [socketInitializer]);
    } catch (error) {
        console.error("Error initializing socket:", error);
    }


    return (

        <div className="flex flex-col items-center gap-4 mt-12">
            {game && <GameBoard game={game} />}
        </div>
    );
}
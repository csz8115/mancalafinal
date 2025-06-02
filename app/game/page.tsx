"use client";
// import { getUser } from "../server-actions/user-actions";
import { useEffect, useState } from 'react';
// import { User } from "@/types/user-type";
import GameBoard from "@/app/game/game-board";
import { Game } from "@/types/game-type";
import socket from "@/app/socket"

export default function Page() {

    return (
        <div className="flex flex-col items-center gap-4 mt-12">
            <h1 className="text-3xl font-bold">Game Page</h1>
            <GameBoard />
        </div>
    );
}
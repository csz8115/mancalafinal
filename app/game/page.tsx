"use client";
import { Suspense } from 'react';
import GameBoard from "@/app/game/game-board";

export default function Page() {

    return (
        <div className="flex flex-col items-center gap-4 mt-12">
            <Suspense fallback={<div className="text-center">Loading game...</div>}>
                <GameBoard />
            </Suspense>
        </div>
    );
}
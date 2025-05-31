import { Button } from '@/components/ui/button';
import {  createGame, joinGame } from '@/lib/server-actions/user-actions';

export default function Page() {

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold">Game</h1>
            <div className="flex flex-col space-y-4"></div>
                <Button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={createGame}
                >
                    Create New Game
                </Button>
                <Button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={joinGame}
                >
                    Join Existing Game
                </Button>
            </div>
    );
}
import Form from 'next/form'
import { Button } from '@/components/ui/button';
import { getGames, createGame, joinGame } from '@/app/server-actions/user-actions';

export default function GameForm() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold">Game</h1>
            <div className="flex flex-col space-y-4"></div>
                <Button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={async () => {
                        // TODO: Implement new game creation
                        console.log('Create new game clicked');
                    }}
                >
                    Create New Game
                </Button>
                <Button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={async () => {
                        // TODO: Implement join game functionality
                        console.log('Join game clicked');
                    }}
                >
                    Join Existing Game
                </Button>
            </div>
    );
}
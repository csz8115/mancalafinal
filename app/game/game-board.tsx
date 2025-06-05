'use client';
// import { useToast } from "@/hooks/use-toast"
import Confetti from 'react-confetti'
import Pit from './pit';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import socket from "@/app/socket"
import { useToast } from '@/hooks/use-toast';
import { Game, User, Status } from '@prisma/client';
import { useRouter } from 'next/navigation';

type GamewithPlayers = Game & {
    player1User: User;
    player2User: User;
};

export default function GameBoard() {
    const [game, setGame] = useState<Game>({} as Game); // Initialize with an empty game object
    const [showConfetti, setShowConfetti] = useState(false);
    const [socketInitialized, setSocketInitialized] = useState(false);
    const user = useUserStore((state) => state);
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const router = useRouter();

    async function socketInitializer() {
        const isNewGame = searchParams.get('createGame');
        const lobbyName = searchParams.get('lobbyName'); // used in both cases
        const userId = user.id;

        if (!lobbyName || !userId) {
            console.error('Missing lobbyName or user ID');
            return;
        }

        if (socketInitialized) {
            return; // Prevent duplicate initialization
        }

        setSocketInitialized(true);

        if (isNewGame) {
            console.log('Creating new game:', lobbyName);
            socket.emit('create-room', lobbyName);
        } else {
            console.log('Joining existing game:', lobbyName);
            socket.emit('join-room', lobbyName, userId);
        }

        // Socket listeners
        socket.on('game-start', (gameData: Game) => {
            console.log('Game started:', gameData);
            setGame(gameData);
        });

        socket.on('game-update', (gameData: Game) => {
            console.log('Game updated:', gameData);
            setGame(gameData);
        });

        socket.on('game-over', (gameData: GamewithPlayers) => {
            console.log('Game over:', gameData);
            setGame(gameData);
            // show confetti if user is the winner
            if (gameData.winner) {
            toast({
                title: 'Game Over',
                description: gameData.winner === user.id ? 'You win!' : 'You lose!',
            });
            } else {
            toast({
                title: 'Game Over',
                description: "It's a tie!",
            });
            }   
            if (gameData.winner === user.id) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
            }
            
            // Redirect to dashboard after 5 seconds
            setTimeout(() => {
            // check if the user is player1 or player2
            if (user.id === gameData.player1) {
                user.setUser(gameData.player1User);
            } else {
                user.setUser(gameData.player2User);
            }
            router.push('/dashboard');
            }, 5000);

        });

        socket.on('error', (err: Error) => {
            console.error('Socket error:', err);
        });
    }

    const handlePitClick = (pitIndex: number) => {
        console.log(`Pit ${pitIndex} clicked by Player ${game.current}`);

        if (game.status === Status.complete ) return;

        // Check if it's the current user's turn
        const isPlayer1Turn = game.current === 'player1' && game.player1 === user.id;
        const isPlayer2Turn = game.current === 'player2' && game.player2 === user.id;

        if (!isPlayer1Turn && !isPlayer2Turn) {
            console.log('Not your turn!');
            return;
        }

        // Emit move to server instead of handling locally
        const lobbyName = searchParams.get('lobbyName');
        if (lobbyName) {
            socket.emit('player-move', {
                lobbyName,
                game,
                pitIndex,
            });
        }
    };

    useEffect(() => {
        // Only initialize socket when required data is available
        if (user.id && searchParams.get('lobbyName') && !socketInitialized) {
            socketInitializer();
        }
    }, [user.id, searchParams, socketInitialized]);

    return (
        <div className="min-h-screen p-8">
            {showConfetti && <Confetti />}

            {game.status === 'waiting' || Object.keys(game).length === 0 ? (
                <div className="text-center">
                    <p className="text-lg text-gray-600">Waiting for another player to join...</p>
                </div>
            ) : (
                <>

                    {/* Rectangular wood-textured board background */}
                    <div className="relative mx-auto w-fit" style={{
                        backgroundImage: `url(https://plus.unsplash.com/premium_photo-1675782999354-2f2711e437a5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
                        backgroundSize: 'cover',
                        borderRadius: '20px',
                        border: '8px solid #654321',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)',
                    }}>
                        <div className="flex items-center justify-center p-8">
                            {/* Player 2's Store (left side) */}
                            <div className="mr-8 flex flex-col items-center">
                                <Pit
                                    stones={game.board?.[13] ?? 0}
                                    onClick={() => { }}
                                    disabled={true}
                                />
                                <div className="mt-2 text-sm font-semibold">
                                    {game.board?.[13] ?? 0}
                                </div>
                            </div>

                            {/* Game board pits */}
                            <div className="flex flex-col justify-center">
                                {/* Player 2's pits (top row) */}
                                <div className="flex justify-center items-center mb-4">
                                    <div className="flex space-x-4">
                                        {Array.from({ length: 6 }, (_, index) => {
                                            const pitIndex = 12 - index;
                                            const stones = game.board?.[pitIndex] ?? 0;
                                            const isPlayer2Turn = game.current === 'player2' && game.player2 === user.id;
                                            return (
                                                <Pit
                                                    key={`pit-${pitIndex}`}
                                                    stones={stones}
                                                    onClick={() => handlePitClick(pitIndex)}
                                                    disabled={!isPlayer2Turn || game.status === Status.complete}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Player 1's pits (bottom row) */}
                                <div className="flex justify-center items-center">
                                    <div className="flex space-x-4">
                                        {Array.from({ length: 6 }, (_, index) => {
                                            const pitIndex = index;
                                            const stones = game.board?.[pitIndex] ?? 0;
                                            const isPlayer1Turn = game.current === 'player1' && game.player1 === user.id;
                                            return (
                                                <Pit
                                                    key={`pit-${pitIndex}`}
                                                    stones={stones}
                                                    onClick={() => handlePitClick(pitIndex)}
                                                    disabled={!isPlayer1Turn || game.status === Status.complete}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Player 1's Store (right side) */}
                            <div className="ml-8 flex flex-col items-center">
                                <Pit
                                    stones={game.board?.[6] ?? 0}
                                    onClick={() => { }}
                                    disabled={true}
                                />
                                <div className="mt-2 text-sm font-semibold">
                                    {game.board?.[6] ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {game.status === Status.complete && (
                        <div className="text-center mt-6">
                            <h2 className="text-2xl font-bold mb-4">
                                {(() => {
                                    if (!game.winner) return "It's a Tie!";
                                    return game.winner === user.id ? "You Win!" : "You Lose!";
                                })()}
                            </h2>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}


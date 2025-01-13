'use client';
import { useToast } from "@/hooks/use-toast"
import { useState } from 'react';
import Confetti from 'react-confetti'
import Pit from './pit';
import { Button } from "@/components/ui/button";

const GameBoard: React.FC = () => {
    const [board, setBoard] = useState([
        [0],                    // Player 2's store
        [4, 4, 4, 4, 4, 4],    // Player 2's pits (6-1)
        [4, 4, 4, 4, 4, 4],    // Player 1's pits (1-6)
        [0]                     // Player 1's store
    ]);
    const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
    const { toast } = useToast();
    const [gameOver, setGameOver] = useState(false);

    const checkWinCondition = (board: number[][]): boolean => {
        const player1PitsEmpty = board[2].every(stones => stones === 0);
        const player2PitsEmpty = board[1].every(stones => stones === 0);

        if (player1PitsEmpty || player2PitsEmpty) {
            // Move remaining stones to respective stores
            const newBoard = [...board.map(row => [...row])];
            if (player1PitsEmpty) {
                const player2Stones = newBoard[1].reduce((sum, stones) => sum + stones, 0);
                newBoard[0][0] += player2Stones;
                newBoard[1] = newBoard[1].map(() => 0);
            } else {
                const player1Stones = newBoard[2].reduce((sum, stones) => sum + stones, 0);
                newBoard[3][0] += player1Stones;
                newBoard[2] = newBoard[2].map(() => 0);
            }
            setBoard(newBoard);
            return true;
        }
        return false;
    };

    const handlePitClick = (row: number, pit: number) => {
        console.log(`Clicked pit ${pit} in row ${row}`);
        // TODO: Implement game logic
        const newBoard = [...board.map(row => [...row])];
        let stones = newBoard[row][pit];
        newBoard[row][pit] = 0;
        let currentRow = row;
        let currentPit = pit;

        // going counter-clockwise, drop one stone in each pit and stores
        while (stones > 0) {
            if (currentRow === 1 && currentPit === 0) {
                currentRow = 2;
                currentPit = 0;
                if (currentPlayer === 2) {
                    // Only drop in store if it's player 2's turn
                    newBoard[0][0] += 1;
                    stones--;
                }
                continue;
            } else if (currentRow === 2 && currentPit === 5) {
                currentRow = 1;
                currentPit = 5;
                if (currentPlayer === 1) {
                    // Only drop in store if it's player 1's turn
                    newBoard[3][0] += 1;
                    stones--;
                }
                continue;
            } else if (currentRow === 1) {
                currentPit -= 1;
                newBoard[currentRow][currentPit] += 1;
            } else if (currentRow === 2) {
                currentPit += 1;
                newBoard[currentRow][currentPit] += 1;
            }

            // Check if last stone landed in an empty pit
            if (stones === 1) {
                if (currentPlayer === 1 && currentRow === 2 && newBoard[currentRow][currentPit] === 1) {
                    // Capture stones for player 1
                    newBoard[3][0] += newBoard[1][currentPit] + 1;
                    newBoard[1][currentPit] = 0;
                    newBoard[2][currentPit] = 0;
                } else if (currentPlayer === 2 && currentRow === 1 && newBoard[currentRow][currentPit] === 1) {
                    // Capture stones for player 2
                    newBoard[0][0] += newBoard[2][currentPit] + 1;
                    newBoard[2][currentPit] = 0;
                    newBoard[1][currentPit] = 0;
                }
            }

            stones--;
        }

        // Update board
        setBoard(newBoard);

        // Turn Logic

        // Check if player gets another turn
        if (currentRow === 1 && currentPit === 5) {
            setCurrentPlayer(1);
            toast({
                title: "Bonus turn",
                description: "Player 1 gets another turn",
            });
        } else if (currentRow === 2 && currentPit === 0) {
            setCurrentPlayer(2);
            toast({
                title: "Bonus turn",
                description: "Player 2 gets another turn",
            });
        } else {
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        }

        // Check win condition
        if (checkWinCondition(newBoard)) {
            toast({
                title: "Game over",
                description: newBoard[0][0] != newBoard[3][0] ? `Player ${newBoard[0][0] > newBoard[3][0] ? 2 : 1} wins!` : "It's a tie",
            })
            setGameOver(true);
        }
    };

    return (
        <>
            <svg className="absolute w-[900px] h-[320px] -z-10" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <pattern id="wood" patternUnits="userSpaceOnUse" width="100%" height="100%">
                        <image href="https://www.textures4photoshop.com/tex/thumbs/free-wood-texture-with-high-resolution-thumb38.jpg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                    </pattern>
                </defs>
                <rect x="0" y="20" width="900" height="300" rx="50"
                    fill="url(#wood)" opacity="0.5" />
            </svg>
            <div className="flex items-center justify-center gap-4 mt-14">
                {gameOver && <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={200}
                    tweenDuration={2500}
                />}
                <Button style={{
                    width: '80px',
                    height: '200px',
                    border: '2px solid',
                    borderColor: currentPlayer === 2 ? '#2196f3' : '#333',
                }}
                    variant="outline"
                    disabled={true}>
                    {board[0][0]}
                </Button>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        {board[1].map((stones, index) => (
                            <Pit
                                key={`2-${index}`}
                                stones={stones}
                                onClick={() => handlePitClick(1, index)}
                                disabled={currentPlayer !== 2}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {board[2].map((stones, index) => (
                            <Pit
                                key={`1-${index}`}
                                stones={stones}
                                onClick={() => handlePitClick(2, index)}
                                disabled={currentPlayer !== 1}
                            />
                        ))}
                    </div>
                </div>
                <Button style={{
                    width: '80px',
                    height: '200px',
                    border: '2px solid #333',
                    borderColor: currentPlayer === 1 ? '#2196f3' : '#333',
                }}
                    variant="outline"
                    disabled={true}>
                    {board[3][0]}
                </Button>
            </div>
        </>
    );
};

export default GameBoard;
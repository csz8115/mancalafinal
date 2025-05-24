'use client';
import { useToast } from "@/hooks/use-toast"
import Confetti from 'react-confetti'
import Pit from './pit';
import { Button } from "@/components/ui/button";
import { Game } from "@/types/game-type";

type GameBoardProps = {
    game: Game;
};


const GameBoard: React.FC<GameBoardProps> = ({game}) => {
    const { toast } = useToast();

    const handlePitClick = (row: number, pit: number) => {
        console.log(`Clicked pit ${pit} in row ${row}`);
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
                {game.status == "complete" && <Confetti
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
                    borderColor: game.current == "Player2" ? '#2196f3' : '#333',
                }}
                    variant="outline"
                    disabled={true}>
                    {game.board[0][0]}
                </Button>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        {game.board[1].map((stones, index) => (
                            <Pit
                                key={`2-${index}`}
                                stones={stones}
                                onClick={() => handlePitClick(1, index)}
                                disabled={game.current !== "Player1"}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {game.board[2].map((stones, index) => (
                            <Pit
                                key={`1-${index}`}
                                stones={stones}
                                onClick={() => handlePitClick(2, index)}
                                disabled={game.current !== "Player1"}
                            />
                        ))}
                    </div>
                </div>
                <Button style={{
                    width: '80px',
                    height: '200px',
                    border: '2px solid #333',
                    borderColor: game.current == "Player1" ? '#2196f3' : '#333',
                }}
                    variant="outline"
                    disabled={true}>
                    {game.board[3][0]}
                </Button>
            </div>
        </>
    );
};

export default GameBoard;
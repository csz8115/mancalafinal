"use client";
import { logout } from "@/lib/server-actions/user-actions";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/custom/hover-card"
import { Diamond } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function Navbar() {
    const user = useUserStore((state) => state);
    const clearUser = useUserStore((s) => s.clearUser);


    const handleLogout = async () => {
        clearUser();
        await logout();
    };

    return (
        <nav className="flex justify-between items-center p-4 text-white sticky top-0 border-b-2 bg-zinc-950">
            <div className="flex items-center">
                <h1 className="text-2xl font-bold">Mancala</h1>
            </div>

            <div className="flex items-center gap-4">
                {user && (
                    <HoverCard>
                        <HoverCardTrigger>
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.url ?? undefined} />
                                <AvatarFallback>{user.username}</AvatarFallback>
                            </Avatar>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <div className="flex-col">
                                <div className="flex gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.url ?? undefined} />
                                        <AvatarFallback>{user.username}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-col">
                                        <h2 className="text-xl font-bold mt-2">{user.username}</h2>
                                        {user.gamesPlayed === 0 && (
                                            <p className="text-sm flex items-center gap-1 text-gray-200">
                                                <Diamond className="h-3 w-3 text-gray-200" /> Newbie
                                            </p>
                                        )}
                                        {user.gamesPlayed != null && user.gamesPlayed >= 1 && user.gamesPlayed < 3 && (
                                            <p className="text-sm flex items-center gap-1 text-green-400">
                                                <Diamond className="h-3 w-3 text-green-400" /> Novice
                                            </p>
                                        )}
                                        {user.gamesPlayed != null && user.gamesPlayed >= 3 && user.gamesPlayed < 5 && (
                                            <p className="text-sm flex items-center gap-1 text-blue-400">
                                                <Diamond className="h-3 w-3 text-blue-400" /> Advanced
                                            </p>
                                        )}
                                        {user.gamesPlayed != null && user.gamesPlayed >= 5 && user.gamesPlayed < 7 && (
                                            <p className="text-sm flex items-center gap-1 text-purple-400">
                                                <Diamond className="h-3 w-3 text-purple-400" /> Expert
                                            </p>
                                        )}
                                        {user.gamesPlayed != null && user.gamesPlayed >= 10 && (
                                            <p className="text-sm flex items-center gap-1">
                                                <Diamond className="h-3 w-3 text-yellow-400" /> Gamer
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                )}

                <div>
                    <Button onClick={handleLogout}>Logout</Button>
                </div>
                <div>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
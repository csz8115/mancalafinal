import { User } from "@/types/user-type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Diamond } from "lucide-react";

export default function UserCard(user: Readonly<User>) {
    return (
        <Card className="w-[350px] shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.url} />
                    <AvatarFallback className="text-lg">{user.username}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{user.username}</CardTitle>
                {user.gamesPlayed == 0 && user.gamesPlayed < 1 && <p className="text-sm flex items-center gap-1 text-gray-200"> <Diamond className="h-3 w-3 text-gray-200" />Newbie</p>}
                {user.gamesPlayed >= 1 && user.gamesPlayed < 3 && <p className="text-sm flex items-center gap-1 text-green-400"> <Diamond className="h-3 w-3 text-green-400" />Novice</p>}
                {user.gamesPlayed >= 3 && user.gamesPlayed < 5 && <p className="text-sm flex items-center gap-1 text-blue-400"> <Diamond className="h-3 w-3 text-blue-400" />Advanced</p>}
                {user.gamesPlayed >= 5 && user.gamesPlayed < 7 && <p className="text-sm flex items-center gap-1 text-purple-400"> <Diamond className="h-3 w-3 text-purple-400" />Expert</p>}
                {user.gamesPlayed >= 10 && <p className="text-sm flex items-center gap-1"> <Diamond className="h-3 w-3 text-yellow-400" />Gamer</p>}
            </CardHeader>
            <CardContent>
                <CardDescription>
                    <div className="space-y-3 text-lg">
                        <p className="font-medium">Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
                        <p className="font-medium">Games Played: {user.gamesPlayed}</p>
                        <p className="font-medium">Games Won: {user.gamesWon}</p>
                        <p className="font-medium">Games Lost: {user.gamesLost}</p>
                        <p className="font-medium">Games Drawn: {user.gamesDrawn}</p>
                    </div>
                </CardDescription>
            </CardContent>
        </Card>
    );

}
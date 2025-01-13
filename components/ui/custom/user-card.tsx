import { User } from "@/types/user-type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Diamond } from "lucide-react";


type UserCardProps = {
    user: User;
    url: string;
};

export default function UserCard(props: Readonly<UserCardProps>) {
    return (
        <Card className="w-[350px] shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={props.url} />
                    <AvatarFallback className="text-lg">{props.user.username}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{props.user.username}</CardTitle>
                {props.user.gamesPlayed == 0 && props.user.gamesPlayed < 1 && <p className="text-sm flex items-center gap-1 text-gray-200"> <Diamond className="h-3 w-3 text-gray-200" />Newbie</p>}
                {props.user.gamesPlayed >= 1 && props.user.gamesPlayed < 3 && <p className="text-sm flex items-center gap-1 text-green-400"> <Diamond className="h-3 w-3 text-green-400" />Novice</p>}
                {props.user.gamesPlayed >= 3 && props.user.gamesPlayed < 5 && <p className="text-sm flex items-center gap-1 text-blue-400"> <Diamond className="h-3 w-3 text-blue-400" />Advanced</p>}
                {props.user.gamesPlayed >= 5 && props.user.gamesPlayed < 7 && <p className="text-sm flex items-center gap-1 text-purple-400"> <Diamond className="h-3 w-3 text-purple-400" />Expert</p>}
                {props.user.gamesPlayed >= 10 && <p className="text-sm flex items-center gap-1"> <Diamond className="h-3 w-3 text-yellow-400" />Gamer</p>}
            </CardHeader>
            <CardContent>
                <CardDescription>
                    <div className="space-y-3 text-lg">
                        <p className="font-medium">Last Login: {props.user.lastLogin?.toLocaleDateString()}</p>
                        <p className="font-medium">Games Played: {props.user.gamesPlayed}</p>
                        <p className="font-medium">Games Won: {props.user.gamesWon}</p>
                        <p className="font-medium">Games Lost: {props.user.gamesLost}</p>
                        <p className="font-medium">Games Drawn: {props.user.gamesDrawn}</p>
                    </div>
                </CardDescription>
            </CardContent>
        </Card>
    );

}
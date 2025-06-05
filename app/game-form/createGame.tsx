"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button";
import { useActionState, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast"
import { createGame } from "@/lib/server-actions/user-actions";


export default function CreateGameComponent() {
    const [state, action, pending] = useActionState(createGame, {});
    const { toast } = useToast();
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (state?.errors) {
            setShowErrors(true);
            toast({
                title: "Game creation failed",
                description: Object.values(state.errors)
                    .map((error) =>
                        Array.isArray(error) ? error.join(", ") : String(error)
                    )
                    .join(" "),
                variant: "destructive",
            });
            
            const timer = setTimeout(() => {
                setShowErrors(false);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [state, toast]);

    return (
        <form action={action} className="space-y-4 rounded-lg border p-6 shadow-md">
            <h1 className="text-2xl font-bold">Create Game</h1>
            <div className="space-y-2">
                <Label htmlFor="gameName">Lobby Name</Label>
                <Input
                    id="lobbyName"
                    name="lobbyName"
                    type="text"
                    placeholder="Enter lobby name"
                    className={showErrors && state?.errors?.lobbyName ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""}
                />
                <div className="space-y-2">
                    <Label>Game Mode</Label>
                    <RadioGroup name="gameMode" className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                                value="Singleplayer" 
                                id="singleplayer" 
                                disabled={true} // Disable singleplayer option
                                className={showErrors && state?.errors?.gameMode ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""}
                            />
                            <Label htmlFor="singleplayer">Singleplayer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                                value="Online" 
                                id="online" 
                                className={showErrors && state?.errors?.gameMode ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""}
                            />
                            <Label htmlFor="online">Online</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
            <Button type="submit" disabled={pending}>Create Game</Button>
        </form>
    );
}

"use client";

import { login } from "@/lib/server-actions/user-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { useUserStore } from '@/store/userStore';
import { set } from "zod";

export default function LoginComponent() {
    const router = useRouter();
    const setUser = useUserStore((s) => s.setUser);
    const [state, action, pending] = useActionState(login, null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.errors) {
            toast({
                title: "Login failed",
                description: Object.values(state.errors)
                    .map((error) =>
                        Array.isArray(error) ? error.join(", ") : String(error)
                    )
                    .join(" "),
                variant: "destructive",
            });
        } 
        // clear the glowing effect in sync with the toast notifications 5s 
        if (state?.errors || state?.success) {
            setTimeout(() => {
                const inputs = document.querySelectorAll("input");
                inputs.forEach(input => {
                    input.classList.remove("border-red-500", "shadow-[0_0_10px_rgba(239,68,68,0.5)]");
                });
            }, 5000);
        }
    }, [state, toast]);

    useEffect(() => {
        if (state?.success) {
            setUser(state.user);
            router.push("/dashboard");
        }
    }, [state, setUser, router]);

    return (
        <form action={action} className="space-y-4 rounded-lg border p-6 shadow-md">
            <h1 className="text-2xl font-bold">Login</h1>
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className={state?.errors?.username ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className={state?.errors?.password ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""}
                />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Logging in..." : "Login"}
            </Button>
        </form>
    );

}
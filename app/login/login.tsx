"use client";

import { login } from "@/lib/server-actions/user-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { useUserStore } from '@/store/userStore';

export default function LoginComponent() {
    const router = useRouter();
    const setUser = useUserStore(state => state.setUser);
    const [loginState, action, pending] = useActionState(login, undefined);
    const { toast } = useToast();

    useEffect(() => {
        if (loginState?.errors) {
            const errorMessages = Object.values(loginState.errors).flat();
            // Display all error messages as one toast notifications
            toast({
                title: "Login Failed",
                description: errorMessages.join(", "),
                variant: "destructive",
            });
        } 
        // clear the glowing effect in sync with the toast notifications 5s 
        if (loginState?.errors || loginState?.success) {
            setTimeout(() => {
                const inputs = document.querySelectorAll("input");
                inputs.forEach(input => {
                    input.classList.remove("border-red-500", "shadow-[0_0_10px_rgba(239,68,68,0.5)]");
                });
            }, 5000);
        }
    }, [loginState, toast]);

    useEffect(() => {
        if (loginState?.success && loginState?.user) {
            setUser(loginState.user);
            // Add a small delay to ensure cookies are set before redirect
            setTimeout(() => {
                router.push("/dashboard");
            }, 100);
        }
    }, [loginState, router, setUser]);

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
                    className={loginState?.errors?.username ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className={loginState?.errors?.password ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""}
                />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Logging in..." : "Login"}
            </Button>
        </form>
    );

}
"use client";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/server-actions/user-actions";
import SubmitButton from "@/components/ui/submit_btn";
import ThemeToggle from "@/components/ui/theme-toggle";
import Link from "next/link";

export default function LoginPage() {
    const [state, loginAction] = useActionState(login, undefined);

    return (
        <>
            <ThemeToggle />
            <div className="flex h-screen w-full items-center justify-center">
                <form action={loginAction} className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-md">
                    <h1 className="text-2xl font-bold">Login</h1>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <SubmitButton />
                    <div className="block text-center text-gray-500 hover:text-gray-700">
                    <Link href="/register">
                        Don't have an account? Register here
                    </Link>
                    </div>
                </form>
            </div>
        </>
    );
}
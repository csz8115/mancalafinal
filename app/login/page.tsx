"use client";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/server-actions/user-actions";
import SubmitButton from "@/components/ui/submit_btn";


export default function LoginPage() {
    const [state, loginAction] = useActionState(login, undefined);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
            <form action={loginAction}>
                <div className="mb-4">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Username"
                    />
                </div>
                {typeof state?.error === 'object' && state.error.username && (
                    <p className="text-red-600">{state.error.username}</p>)}
                <div className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Your password"
                    />
                </div>
                {typeof state?.error === 'object' && state.error.password && (
                    <p className="text-red-600">{state.error.password}</p>)}
                <SubmitButton />
                <p className="text-center mt-4">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-600 hover:underline">
                        register here
                    </a>
                </p>
            </form>
        </div>
    );
}
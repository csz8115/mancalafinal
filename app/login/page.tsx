"use client"; // Indicate that this is a client-side component

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/server-actions/user-actions"; // Import the server action


export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await login(username, password); // Call the server action to log in
            router.push("/dashboard"); // Redirect to the dashboard if successful
        } catch (err: any) {
            setError(err.message); // Display error message
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                </div>
                <div className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        required
                    />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">Registration successful!</p>}
                <Button type="submit" className="w-full">
                    Submit
                </Button>
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
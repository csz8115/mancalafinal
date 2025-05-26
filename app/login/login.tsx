"use client";
import { login } from "@/app/server-actions/user-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/ui/submit_btn";
import { useActionState } from "react";
import { useToast } from "@/hooks/use-toast"
import { z } from "zod";

export default function LoginComponent() {
    const [loginState] = useActionState(login, undefined);
    const { toast } = useToast()

    return (
        <form action={async (formData: FormData) => {
            try {
            // const response = await loginAction(formData)
            const login = loginSchema.safeParse(Object.fromEntries(formData));
            if (!login.success) {
                // parse through the error object and display the error message
                const error = login.error.flatten().fieldErrors;
                toast({
                    title: "Error",
                    description: [error.username, error.password].filter(Boolean).join(" "),
                    variant: "destructive",
                });
                // show a red border around the input field that has the error
                const usernameError = error.username?.[0];
                const passwordError = error.password?.[0];
                // Add error class to input fields
                document.getElementById('username')?.classList.toggle('border-red-500', !!usernameError);
                document.getElementById('password')?.classList.toggle('border-red-500', !!passwordError);
                setTimeout(() => {
                    document.getElementById('username')?.classList.remove('border-red-500');
                    document.getElementById('password')?.classList.remove('border-red-500');
                }, 5000);

                return;
            }
        } catch (error) {
            console.error("Login error:", error);
            console.log("Login state:", loginState);
            toast({
                title: "Login failed",
                description: "Please try again later.",
                variant: "destructive",
            });
        }
        }} className="space-y-4 rounded-lg border p-6 shadow-md">
            <h1 className="text-2xl font-bold">Login</h1>

            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                />
            </div>
            <SubmitButton />
        </form>
    );

}

const loginSchema = z.object({
    username: z.string()
        .nonempty("Username cannot be blank")
        .min(4, "Username must be at least 4 characters")
        .max(20, "Username cannot exceed 20 characters")
        .trim(),
    password: z.string()
        .nonempty("Password cannot be blank")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password cannot exceed 50 characters")
        .trim(),
});
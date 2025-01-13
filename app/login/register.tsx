"use client";
import { register } from "@/app/server-actions/user-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/ui/submit_btn";
import { useActionState } from "react";
import { useToast } from "@/hooks/use-toast"
import { z } from "zod";

export default function LoginComponent() {
    const [registerState, registerAction] = useActionState(register, undefined);
    const { toast } = useToast();

    return (
        <form action={async (formData: FormData) => {
            const response = await registerAction(formData)
            const register = registerSchema.safeParse(Object.fromEntries(formData));
            if (!register.success) {
                // parse through the error object and display the error message
                const error = register.error.flatten().fieldErrors;
                toast({
                    title: "Error",
                    description: [error.username, error.password, error.confirmPassword].filter(Boolean).join(" "),
                    variant: "destructive",
                });
                // show a red border around the input field that has the error
                const usernameError = error.username?.[0];
                const passwordError = error.password?.[0];
                const confirmPasswordError = error.confirmPassword?.[0];
                // Add error class to input fields
                document.getElementById('username')?.classList.toggle('border-red-500', !!usernameError);
                document.getElementById('password')?.classList.toggle('border-red-500', !!passwordError);
                document.getElementById('confirmPassword')?.classList.toggle('border-red-500', !!confirmPasswordError);
                setTimeout(() => {
                    document.getElementById('username')?.classList.remove('border-red-500');
                    document.getElementById('password')?.classList.remove('border-red-500');
                    document.getElementById('confirmPassword')?.classList.remove('border-red-500');
                }, 5000);
                
                return;
            }
        }} className="space-y-4 rounded-lg border p-6 shadow-md">
            <h1 className="text-2xl font-bold">Register</h1>

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

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                />
            </div>
            <SubmitButton />
        </form>
    );
}

const registerSchema = z.object({
    username: z.string()
    .nonempty("username cannot be blank")
    .min(4, "Username must be at least 4 Characters")
    .max(20, "Username cannot exceed 20 Characters")
    .regex(
        /^[\x20-\x7E\s]*$/,
        "Only printable characters are allowed"
    )
    .trim(),
    password: z.string()
    .nonempty("password cannot be blank")
    .min(8, "password must be at least 4 Characters")
    .max(50, "Password cannot exceed 50 Characters")
    .regex(
        /^[\x20-\x7E\s]*$/,
        "Only printable characters are allowed"
    )
    .trim(),
    confirmPassword: z.string()
    .nonempty("confirm password cannot be blank")
    .min(8)
    .max(50)
    .trim(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
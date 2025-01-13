"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ui/theme-toggle";
import LoginComponent from "@/app/login/login";
import RegisterComponent from "@/app/login/register";

export default function LoginPage() {

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <ThemeToggle />
            <Tabs defaultValue="login" className="mx-auto w-full max-w-md">
                <TabsList className="flex space-x-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <LoginComponent />
                </TabsContent>
                <TabsContent value="register">
                    <RegisterComponent />
                </TabsContent>
            </Tabs>
        </div>
    );
}
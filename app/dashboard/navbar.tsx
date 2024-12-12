"use client";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/server-actions/user-actions"; // Import the server action

export default function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        logout(); // Call the server action to log out
        router.push("/login");
    };

    return (
        <nav className="w-full border-b px-6 py-3">
            <NavigationMenu>
                <NavigationMenuList className="w-full flex justify-between items-center">
                    <NavigationMenuItem>
                        <h1 className="text-xl font-bold">Mancala</h1>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <Button variant="outline" onClick={handleLogout} className="ml-auto">
                            Logout
                        </Button>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </nav>
    );
}
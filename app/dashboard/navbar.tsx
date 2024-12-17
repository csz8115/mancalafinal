import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { logout } from "../server-actions/user-actions";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";


export default function Navbar() {

    return (
        <nav className="w-full border-b px-6 py-3">
            <ThemeToggle />
            <NavigationMenu>
                <NavigationMenuList className="w-full flex justify-between items-center">
                    <NavigationMenuItem>
                        <h1 className="text-xl font-bold">Mancala</h1>
                    </NavigationMenuItem>

                    <div className="flex items-center gap-4">
                        <NavigationMenuItem>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Button variant="outline" onClick={logout}>
                                Logout
                            </Button>
                        </NavigationMenuItem>
                    </div>
                </NavigationMenuList>
            </NavigationMenu>
        </nav>
    );
}
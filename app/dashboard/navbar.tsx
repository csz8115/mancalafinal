import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { logout } from "../server-actions/user-actions";
import { Button } from "@/components/ui/button";

export default function Navbar() {

return(<nav className="w-full border-b px-6 py-3">
<NavigationMenu>
    <NavigationMenuList className="w-full flex justify-between items-center">
        <NavigationMenuItem>
            <h1 className="text-xl font-bold">Mancala</h1>
        </NavigationMenuItem>

        <NavigationMenuItem>
            <Button variant="outline" onClick={logout} className="ml-auto">
                Logout
            </Button>
        </NavigationMenuItem>
    </NavigationMenuList>
</NavigationMenu>
</nav>);
}
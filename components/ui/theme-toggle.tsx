"use client";
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    useEffect(() => {
        setTheme('dark')
    }, [])

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-full"
        >
            {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
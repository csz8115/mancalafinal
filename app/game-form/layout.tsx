import Navbar from "@/components/ui/custom/navbar-alt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (<div className="flex flex-col h-screen">
    <Navbar />
    <main className="flex-1 p-4">
      {children}
    </main>
  </div>)
}
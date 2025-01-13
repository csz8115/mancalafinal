import Navbar from "@/components/ui/custom/navbar"
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-">
      <Card>
        <CardHeader>
          <CardTitle>New Game</CardTitle>
          <CardDescription>Start a new game of Mancala</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/game">
            <Button variant="outline" className="w-full">Start New Game</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game History</CardTitle>
          <CardDescription>View your previous games</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/history">
            <Button variant="outline" className="w-full">View History</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
          <CardDescription>Learn how to play Mancala</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/rules">
            <Button variant="secondary" className="w-full">View Rules</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View and edit your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/profile">
            <Button variant="outline" className="w-full">Manage Profile</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
    <main className="flex-1 p-4">
      {children}
    </main>
  </div>)
}
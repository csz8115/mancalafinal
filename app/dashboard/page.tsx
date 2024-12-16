'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Navbar from "@/app/dashboard/navbar"
import chat from "@/app/dashboard/chat"
import ChatComponent from "@/app/dashboard/chat"

export default function Dashboard() {
    return (
        <>
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-8">Mancala Game Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Game</CardTitle>
                            <CardDescription>Start a new game of Mancala</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/game/new">
                                <Button className="w-full">Start New Game</Button>
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
                <ChatComponent />
            </div>
        </>
    )
}
'use client'

import ChatComponent from "@/app/dashboard/chat"
import socket from "@/app/socket"
import { useEffect } from 'react'
import { useState } from 'react'
import { useSession } from "@/hooks/use-session";
import { Chat } from "@/types/chat-type"

export default function Dashboard() {
    const [messages, setMessages] = useState<Chat[]>([]);
    const { session, loading } = useSession();

    async function socketInitializer() {
        socket.on('hello', (incomingMessages: any) => {
            console.log('Received hello:', incomingMessages)
            // set messages to the incoming messages array
            setMessages(incomingMessages.messages as Chat[])
        })

        socket.on('new message', (incomingMessage: Chat) => {
            console.log('Received new message:', incomingMessage)
            setMessages((messages) => [...messages, incomingMessage])
        })

        socket.on('message', (incomingMessage: Chat) => {
            console.log('Received message:', incomingMessage)
            setMessages((messages) => [...messages, incomingMessage])
        })

        socket.on('error', (error: string) => {
            console.error('Socket error:', error)
        })

        socket.emit('hello', { messages: "hello from client" });
    
    }

    useEffect(() => {
        socketInitializer()
    }, []);

    return (
            <div className="container mx-auto p-8">
                
                { session && <ChatComponent messages={messages} session={session}/>}
            </div>
    )
}
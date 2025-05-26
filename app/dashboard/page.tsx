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
        socket.on('hello', (incomingMessages: { messages: Chat[] }) => {
            try {
                console.log('Received hello:', incomingMessages)
                // set messages to the incoming messages array
                setMessages(incomingMessages.messages);
            } catch (error) {
                console.error('Error processing hello message:', error);
            }
        })

        socket.on('new message', (incomingMessage: { messages: Chat[] }) => {
            try {
                console.log('Received new message:', incomingMessage)
                // set messages to the incoming messages array
                setMessages((messages) => [...messages, ...incomingMessage.messages])
            } catch (error) {
                console.error('Error processing new message:', error);
            }
        })

        socket.on('message', (incomingMessage: Chat) => {
            try {
                console.log('Received message:', incomingMessage)
                // add the incoming message to the messages array
                setMessages((messages) => [...messages, incomingMessage])
            } catch (error) {
                console.error('Error processing message:', error);
            }
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
                { loading && <p>Loading...</p>}
                { session && <ChatComponent messages={messages} session={session}/>}
            </div>
    )
}
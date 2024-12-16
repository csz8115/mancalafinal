'use client'

import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'
import { useActionState } from 'react';
import { newMessage } from '../server-actions/user-actions';
import SubmitButton from '@/components/ui/submit_btn';
import { ChatBubbleAvatar } from '@/src/components/ui/chat/chat-bubble';
import { ChatBubbleMessage } from '@/src/components/ui/chat/chat-bubble';
import { ChatBubble } from '@/src/components/ui/chat/chat-bubble';
import { ExpandableChat } from '@/src/components/ui/chat/expandable-chat';
import { ExpandableChatBody } from '@/src/components/ui/chat/expandable-chat';
import { ExpandableChatHeader } from '@/src/components/ui/chat/expandable-chat';
import { ExpandableChatFooter } from '@/src/components/ui/chat/expandable-chat';
import { ChatMessageList } from '@/src/components/ui/chat/chat-message-list';
import { ChatInput } from '@/src/components/ui/chat/chat-input';
import { Button } from "@/components/ui/button";
import { useSession } from "@/utils/use-session";

let socket: typeof Socket

type Chat = {
    message: string;
    createdAt: Date;
    userId: string;
    username: string;
}

// get session data 

export default function Chat() {
    const [messages, setMessages] = useState<Chat[]>([]);
    const [state, messageAction] = useActionState(newMessage, undefined);
    const { session } = useSession();

    useEffect(() => {
        socketInitializer()
        return () => {
            if (socket) socket.disconnect()
        }
    }, [])

    async function socketInitializer() {
        socket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

        socket.on('connect', () => {
            console.log('Connected to socket')
            socket.emit('hello', { messages: "hello from client" });
        })

        socket.on('disconnect', () => {
            console.log('Disconnected from socket')
        })

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
    }

    // return (
    //     <div className="p-4">
    //         <div className="mb-4 h-64 overflow-y-auto border p-4">
    //             {messages.map((message, index) => (
    //                 <div key={index} className="mb-2">
    //                     {message}
    //                 </div>
    //             ))}
    //         </div>
    //         <form action={messageAction} className="flex gap-2">
    //             <input
    //                 type="text"
    //                 id="message"
    //                 name="message"
    //                 className="flex-1 rounded border p-2"
    //                 placeholder="Type a message..."
    //             />
    //             <SubmitButton />
    //         </form>
    //     </div>
    // )

    return (
        <ExpandableChat size="lg" position="bottom-right">
            <ExpandableChatHeader className="flex-col text-center justify-center">
            <h1 className="text-xl font-semibold">Chat Room</h1>
            </ExpandableChatHeader>
            <ExpandableChatBody>
            <ChatMessageList>
                {messages.map((message, index) => (
                <ChatBubble key={index} className="flex items-start gap-2">
                    <ChatBubbleAvatar/>
                    <ChatBubbleMessage>
                    <h3 className="font-semibold">{message.username}</h3>
                    <p>{message.message}</p>
                    </ChatBubbleMessage>
                </ChatBubble>
                ))}
            </ChatMessageList>
            </ExpandableChatBody>
            <ExpandableChatFooter>
            <form 
                action={async (formData: FormData) => {
                const message = formData.get('message') as string;
                const chat : Chat = {
                    message,
                    createdAt: new Date(),
                    userId: session.session?.userId,
                    username: session.session?.username
                }
                socket.emit('message', chat);
                messageAction(formData);
                }} 
                className="flex w-full gap-2"
            >
                <ChatInput 
                name="message"
                placeholder="Type a message..."
                />
                <Button type="submit" size="icon">
                Send
                </Button>
            </form>
            </ExpandableChatFooter>
        </ExpandableChat>
    )
}
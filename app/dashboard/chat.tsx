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
import { ScrollArea } from '@/components/ui/scroll-area';

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

    return (
        <>
            <ScrollArea className="h-[400px] overflow-y-auto mb-4" id="chat-scroll-area">
                <ChatMessageList>
                    {messages.map((chat, index) => (
                    <ChatBubble key={index} className="flex items-start gap-2">
                        <ChatBubbleAvatar src='https://64.media.tumblr.com/7e8ded3b263d254cac5b00434ea60b40/353f4ef1923113d7-f9/s500x750/6be4c18a40062f0549954b4f049bc11290122aa9.png'/>
                        <ChatBubbleMessage>
                        <h3 className="font-semibold">{chat.username}</h3>
                        <p>{chat.message}</p>
                        </ChatBubbleMessage>
                    </ChatBubble>
                    ))}
                </ChatMessageList>
                {/* Add an empty div for scroll anchor */}
                <div ref={(el) => {
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                    }
                }} />
            </ScrollArea>
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
                className="flex w-full items-center gap-2"
            >
                <ChatInput 
                placeholder="Type a message..."
                />
                <Button type="submit" size="icon" className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11Z"/>
                    </svg>
                </Button>
            </form>
        </>
    )
}
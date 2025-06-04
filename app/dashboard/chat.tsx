'use client'

import { ChatBubbleAvatar } from '@/src/components/ui/chat/chat-bubble';
import { ChatBubbleMessage } from '@/src/components/ui/chat/chat-bubble';
import { ChatBubble } from '@/src/components/ui/chat/chat-bubble';
import { ChatMessageList } from '@/src/components/ui/chat/chat-message-list';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatForm from './chat-form';
import { Chat } from "@/types/chat-type"
import { useUserStore } from '@/store/userStore';
import { useEffect, useRef } from 'react';

export default function ChatComponent({ messages }: { messages: Chat[]}) {
    const user = useUserStore((state) => state);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div>
            {messages && (
            <ScrollArea ref={scrollAreaRef} className="h-[400px] overflow-y-auto mb-4" id="chat-scroll-area">
                <ChatMessageList>
                {messages.map((chat, index) => (
                    <ChatBubble key={index} variant={chat.userId === user?.id ? 'sent' : 'received'} className="flex items-start gap-1 p-2">
                    <ChatBubbleAvatar src={chat.url} />
                    <ChatBubbleMessage variant={chat.userId === user?.id ? 'sent' : 'received'}>
                        <h2 className="font-semibold">{chat.username}</h2>
                        <p>{chat.message}</p>
                        <time className="text-xs text-gray-500">
                        {new Date(chat.createdAt).toDateString() !== new Date().toDateString() ? (
                            `${new Date(chat.createdAt).toLocaleDateString()} `
                        ) : null}
                        {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                    </ChatBubbleMessage>
                    </ChatBubble>
                ))}
                </ChatMessageList>
            </ScrollArea>
            )}
            <ChatForm/>
        </div>
    )
}
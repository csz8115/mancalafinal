'use client'

import { ChatBubbleAvatar } from '@/src/components/ui/chat/chat-bubble';
import { ChatBubbleMessage } from '@/src/components/ui/chat/chat-bubble';
import { ChatBubble } from '@/src/components/ui/chat/chat-bubble';
import { ChatMessageList } from '@/src/components/ui/chat/chat-message-list';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatForm from './chat-form';
import { Chat } from "@/types/chat-type"
import { Session } from "@/types/session-type";

// get session data 

export default function ChatComponent({ messages, session }: { messages: Chat[], session: Session }) {

    return (
        <div>
            {session && messages && (
                <ScrollArea className="h-[400px] overflow-y-auto mb-4" id="chat-scroll-area">
                    <ChatMessageList>
                        {messages.map((chat, index) => (
                            <ChatBubble key={index} variant={chat.userId === session?.userId ? 'sent' : 'received'} className="flex items-start gap-1 p-2">
                                <ChatBubbleAvatar src={chat.url} />
                                <ChatBubbleMessage variant={chat.userId === session?.userId ? 'sent' : 'received'}>
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
                    <div ref={(el) => {
                        if (el) {
                            el.scrollIntoView({ behavior: "smooth" });
                        }
                    }} />
                </ScrollArea>
            )}
            <ChatForm session={session} />
        </div>
    )
}
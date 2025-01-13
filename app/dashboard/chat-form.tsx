import { z } from "zod";
import { useToast } from "@/hooks/use-toast"
import { ChatInput } from '@/src/components/ui/chat/chat-input';
import { Button } from "@/components/ui/button"
import { newMessage } from '../server-actions/user-actions';
import socket from "@/app/socket"
import { useActionState } from 'react';
import { Chat } from "@/types/chat-type"
import { Session } from "@/types/session-type";
import { SendHorizonal } from "lucide-react";
import Form from 'next/form'



export default function ChatForm({ session }: { session: Session }) {
    const { toast } = useToast();
    const [state, messageAction] = useActionState(newMessage, undefined);

    const messageSchema = z.object({
        message: z.string().nonempty().min(1).max(255).trim(),
    });

    return (
        <Form
            id="chat-form"
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const form = (e.target as HTMLElement).closest('form') as HTMLFormElement;
                    const formData = new FormData(form);

                    const message = messageSchema.safeParse(Object.fromEntries(formData));
                    if (!message.success) {
                        toast({
                            title: "Message failed to send",
                            description: "Please try again",
                            variant: "destructive",
                        })
                        return;
                    }

                    form.reset();
                    const chat: Chat = {
                        message: message.data.message,
                        createdAt: new Date(),
                        userId: session?.userId,
                        username: session?.username,
                        url: session?.url
                    }
                    socket.emit('message', chat);
                    newMessage("", formData);
                    toast({
                        title: "Message sent",
                        description: "Friday, February 10, 2023 at 5:57 PM",
                    })
                }
            }}
            action={async (formData: FormData) => {
                const message = formData.get('message') as string;

                const result = messageSchema.safeParse({ message });
                if (!result.success) {
                    // display error toast
                    toast({
                        title: "Message failed to send",
                        description: "Please try again",
                        variant: "destructive",
                    })
                    return;
                }

                const chatForm = document.getElementById('chat-form') as HTMLFormElement;
                chatForm.reset();
                const chat: Chat = {
                    message,
                    createdAt: new Date(),
                    userId: session?.userId,
                    username: session?.username,
                    url: session?.url
                }
                socket.emit('message', chat);
                messageAction(formData);
            }}
            className="flex w-full items-center gap-2"
        >
            <ChatInput
                placeholder="Type a message..."
            />
            <Button type="submit" size="icon" className="flex-shrink-0 h-14">
                <SendHorizonal className="" />
            </Button>
        </Form>
    )
}
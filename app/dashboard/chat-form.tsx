import { useToast } from "@/hooks/use-toast"
import { ChatInput } from '@/src/components/ui/chat/chat-input';
import { Button } from "@/components/ui/button"
import { newMessage } from '../../lib/server-actions/user-actions';
import socket from "@/app/socket"
import { useActionState } from 'react';
import { SendHorizonal } from "lucide-react";
import { useUserStore } from '@/store/userStore';
import Form from 'next/form'
import { ChatSchema } from "@/types/chat-type";

export default function ChatForm() {
    const { toast } = useToast();
    const user = useUserStore((state) => state);
    const [state, messageAction, pending] = useActionState(newMessage, undefined);

    const handleSubmit = async (formData: FormData) => {
        // Validate form data client-side
        const parsed = ChatSchema.safeParse({
            message: formData.get('message'),
            userId: formData.get('userId'),
            username: formData.get('username'),
            url: formData.get('url'),
        });
        // If validation fails, show error toast and return
        if (!parsed.success) {
            toast({
                title: "Error",
                description: "Please check your message and try again.",
                variant: "destructive",
            });
            return;
        }
        // Emit websocket message
        socket.emit('message', {
            message: formData.get('message') as string,
            userId: user.id,
            username: user.username,
            createdAt: new Date().toISOString(),
            url: user.url || ''
        });
        // Execute server action
        messageAction(formData);
    };

    // Handle Enter key to submit the form
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) {
                form.requestSubmit();
            }
            console.log(state)
        }
    };

    return (
        <Form action={handleSubmit} className="flex w-full items-center gap-2">
            <input type="hidden" name="userId" value={user.id || ''} />
            <input type="hidden" name="username" value={user.username || ''} />
            <input type="hidden" name="url" value={user.url || ''} />
            <ChatInput
                placeholder="Type a message..."
                disabled={pending}
                name="message"
                onKeyDown={handleKeyDown}
            />
            <Button type="submit" size="icon" className="flex-shrink-0 h-14" disabled={pending}>
                <SendHorizonal />
            </Button>
        </Form>
    );
}

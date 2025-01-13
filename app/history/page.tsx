"use client";
import { useSession } from "@/hooks/use-session";
import { getUser } from "../server-actions/user-actions";
import { useEffect } from 'react'
import { useState } from 'react'
import { User } from "@/types/user-type";
import UserCard from "@/components/ui/custom/user-card";

export default function Page() {
    const { session } = useSession();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (session) {
            getUser(session.username).then(setUser);
        }
    }, [session]);


    return ( 
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold">History</h1>
            <div className="mt-4">
                {user && session && (
                    <UserCard user={user} url={session.url} />
                )}
            </div>
        </div>
    );
}
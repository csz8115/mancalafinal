"use client";

import { useEffect, useState } from "react";
import { Session } from "@/types/session-type";

export function useSession() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch("/api/getSessionInfo");
                const data = await response.json();
                setSession(data.session);
                console.log(data.session);
            } catch (error) {
                setSession(null);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, []);

    return {
        session,
        loading,
    };
}
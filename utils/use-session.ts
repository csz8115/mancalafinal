"use client";

import { useEffect, useState } from "react";

export function useSession() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch("/api/getSessionInfo");
                const data = await response.json();
                setSession(data);
                console.log(data);
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
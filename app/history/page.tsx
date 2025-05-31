"use client";
import { useUserStore } from "@/store/userStore";
import UserCard from "@/components/ui/custom/user-card";

export default function Page() {
    const user = useUserStore((state) => state);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold">History</h1>
            <div className="mt-4">
                {user && user.id && (
                    <UserCard {...user} />
                )}
            </div>
        </div>
    );
}
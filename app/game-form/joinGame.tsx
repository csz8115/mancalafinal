'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import socket from '@/app/socket';
import { joinGame } from '@/lib/server-actions/user-actions';

export default function JoinGame() {
    const router = useRouter();
    const [rooms, setRooms] = useState<any[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);

    // Fetch available rooms on mount and every 3 seconds
    useEffect(() => {
        const fetchRooms = () => {
            socket.emit('get-rooms');
        };

        // Initial fetch
        fetchRooms();

        // Set up interval to refetch every 3 seconds
        const interval = setInterval(fetchRooms, 3000);

        socket.on('rooms-list', (roomsList) => {
            setRooms(roomsList);
            setLoadingRooms(false);
        });

        return () => {
            socket.off('rooms-list');
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="space-y-6">
            <div className="rounded-lg border p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Available Games</h2>
                {loadingRooms ? (
                    <p>Loading rooms...</p>
                ) : (
                    rooms.length > 0 ? (
                        <ul className="space-y-3">
                            {rooms.map((room) => (
                                <li key={room.lobbyName} className="flex justify-between items-center">
                                    <span>{room.lobbyName}</span>
                                    <Button onClick={() => joinGame(room.lobbyName)} className="bg-blue-500 text-white hover:bg-blue-600">
                                        Join
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600">
                            No available games found. <br /> You can create one from the home page or start a new game.
                        </p>
                    )
                )}
            </div>
        </div>
    );
}

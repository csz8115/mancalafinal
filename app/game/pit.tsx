import { PitProps } from "@/types/pit-type";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";

type Marble = { id: string; isDropping: boolean };

const Pit = ({ stones, onClick, disabled }: PitProps) => {
    const [marbles, setMarbles] = useState<Marble[]>([]);

    useEffect(() => {
        setMarbles(prev => {
            const currentCount = prev.length;
            const diff = stones - currentCount;

            if (diff > 0) {
                // Add new dropping marbles
                const newMarbles: Marble[] = Array.from({ length: diff }, () => ({
                    id: Math.random().toString(36).substring(2, 9),
                    isDropping: true
                }));
                return [...prev, ...newMarbles];
            } else if (diff < 0) {
                // Remove excess marbles
                return prev.slice(0, stones);
            }
            return prev;
        });
    }, [stones]);

    // Convert dropping marbles to static after animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setMarbles(prev => prev.map(marble => ({ ...marble, isDropping: false })));
        }, 100);
        return () => clearTimeout(timer);
    }, [marbles.filter(m => m.isDropping).length]);

    const renderMarbles = () => {
        return marbles.map((marble) => (
            
            <motion.div
            key={marble.id}
            className="w-5 h-5 bg-white rounded-full border-2 border-gray-800 shadow-lg"
            style={{
                position: 'absolute',
                left: `${Math.random() * 60 + 10}%`,
                top: `${Math.random() * 60 + 10}%`,
                zIndex: 2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
            }}
            initial={marble.isDropping ? { y: -150, opacity: 0, scale: 0.8 } : false}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={marble.isDropping ? {
                type: 'spring',
                stiffness: 100,
                damping: 15,
                mass: 1.2,
                duration: 0.8,
            } : {
                type: 'tween',
                duration: 0.3,
            }}
            />
        ));
    };

    return (
        <Button
            className="relative w-20 h-20 rounded-lg border border-amber-400 shadow-md flex items-center justify-center overflow-hidden active:brightness-75"
            style={{
            backgroundImage: `url(https://plus.unsplash.com/premium_photo-1675782999354-2f2711e437a5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(3.3) contrast(0.8)',
            }}
            onClick={onClick}
            disabled={disabled}
        >
            <AnimatePresence>{renderMarbles()}</AnimatePresence>
        </Button>
    );
};

export default Pit;

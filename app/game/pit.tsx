import { PitProps } from "@/types/pit-type";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                className="w-5 h-5 bg-amber-600 rounded-full border border-amber-800 shadow-sm"
                style={{
                    position: 'absolute',
                    left: `${Math.random() * 60 + 10}%`,
                    top: `${Math.random() * 60 + 10}%`,
                    zIndex: 2,
                }}
                initial={marble.isDropping ? { y: -150, opacity: 0, scale: 0.8 } : false}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={marble.isDropping ? {
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                    mass: 1.2,
                    duration: 0.8,
                } : {}}
            />
        ));
    };

    return (
        <motion.button
            className="relative w-20 h-20 bg-amber-200 rounded-lg border border-amber-400 shadow-md flex items-center justify-center overflow-hidden"
            onClick={onClick}
            disabled={disabled}
        >
            <AnimatePresence>{renderMarbles()}</AnimatePresence>
        </motion.button>
    );
};

export default Pit;

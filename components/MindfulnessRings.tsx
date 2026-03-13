'use client'

/**
 * Apple Activity Rings adaptation for Mindfulness
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActivityData {
    label: string;
    value: number;
    color: string;
    size: number;
    current: number;
    target: number;
    unit: string;
}

interface CircleProgressProps {
    data: ActivityData;
    index: number;
}

const CircleProgress = ({ data, index }: CircleProgressProps) => {
    const strokeWidth = 14;
    const radius = (data.size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    // Cap progress at 100 for visual appeal, or let it overflow if we want 
    const percentage = Math.min(data.value, 100);
    const progress = ((100 - percentage) / 100) * circumference;

    const gradientId = `gradient-${data.label.toLowerCase()}`;
    const gradientUrl = `url(#${gradientId})`;

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
        >
            <div className="relative">
                <svg
                    width={data.size}
                    height={data.size}
                    viewBox={`0 0 ${data.size} ${data.size}`}
                    className="transform -rotate-90"
                    aria-label={`${data.label} Activity Progress - ${data.value}%`}
                >
                    <title>{`${data.label} Activity Progress - ${data.value}%`}</title>

                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                style={{
                                    stopColor: data.color,
                                    stopOpacity: 1,
                                }}
                            />
                            <stop
                                offset="100%"
                                style={{
                                    stopColor: 
                                        data.label === "LOGS" 
                                            ? "#F472B6" // rose-400
                                            : data.label === "PLAY" 
                                            ? "#38BDF8" // sky-400
                                            : "#34D399", // emerald-400
                                    stopOpacity: 1,
                                }}
                            />
                        </linearGradient>
                    </defs>

                    <circle
                        cx={data.size / 2}
                        cy={data.size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-100"
                    />

                    <motion.circle
                        cx={data.size / 2}
                        cy={data.size / 2}
                        r={radius}
                        fill="none"
                        stroke={gradientUrl}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: progress }}
                        transition={{
                            duration: 1.8,
                            delay: index * 0.2,
                            ease: "easeInOut",
                        }}
                        strokeLinecap="round"
                        style={{
                            filter: "drop-shadow(0 0 4px rgba(0,0,0,0.1))",
                        }}
                    />
                </svg>
            </div>
        </motion.div>
    );
};

const DetailedActivityInfo = ({ activities }: { activities: ActivityData[] }) => {
    return (
        <motion.div
            className="flex flex-col gap-5 ml-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            {activities.map((activity) => (
                <motion.div key={activity.label} className="flex flex-col group">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        {activity.label}
                    </span>
                    <span
                        className="text-xl font-black flex items-center gap-1.5"
                        style={{ color: activity.color }}
                    >
                        {activity.current}
                        <span className="text-gray-300 text-sm font-bold">/</span>
                        <span className="text-gray-400 font-bold">{activity.target}</span>
                        <span className="text-[10px] ml-1 text-gray-400 font-bold uppercase tracking-tighter">
                            {activity.unit}
                        </span>
                    </span>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default function MindfulnessRings({
    moods,
    games,
    assessments,
    className,
}: {
    moods: number;
    games: number;
    assessments: number;
    className?: string;
}) {
    const activities: ActivityData[] = [
        {
            label: "LOGS",
            value: (moods / 7) * 100,
            color: "#E11D48", // rose-600
            size: 150,
            current: moods,
            target: 7,
            unit: "Checks",
        },
        {
            label: "PLAY",
            value: (games / 3) * 100,
            color: "#0369A1", // sky-700
            size: 110,
            current: games,
            target: 3,
            unit: "Games",
        },
        {
            label: "TEST",
            value: (assessments / 1) * 100,
            color: "#059669", // emerald-600
            size: 70,
            current: assessments,
            target: 1,
            unit: "Score",
        },
    ];

    return (
        <div
            className={cn(
                "bg-white rounded-[2.5rem] p-8 shadow-sm border border-white",
                className
            )}
        >
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-8 px-2">
                   <h3 className="text-gray-900 font-bold text-lg">Mindfulness Habit</h3>
                   <span className="text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">Weekly Goal</span>
                </div>

                <div className="flex items-center justify-center">
                    <div className="relative w-[150px] h-[150px] shrink-0">
                        {activities.map((activity, index) => (
                            <CircleProgress
                                key={activity.label}
                                data={activity}
                                index={index}
                            />
                        ))}
                    </div>
                    <DetailedActivityInfo activities={activities} />
                </div>
            </div>
        </div>
    );
}

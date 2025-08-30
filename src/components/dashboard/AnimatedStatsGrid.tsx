"use client";

import { motion } from "framer-motion";
import { AnimatedDashboardCard } from "./AnimatedDashboardCard";
import { User, BookOpen, Trophy, Calendar } from "lucide-react";

interface AnimatedStatsGridProps {
    stats: {
        totalClasses?: number;
        completedLessons?: number;
        achievements?: number;
        upcomingEvents?: number;
    };
}

export function AnimatedStatsGrid({ stats }: AnimatedStatsGridProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
            <motion.div variants={cardVariants}>
                <AnimatedDashboardCard
                    title="Total Classes"
                    value={stats.totalClasses || 0}
                    description="Classes you've attended"
                    icon={<User className="w-5 h-5" />}
                    delay={0.1}
                />
            </motion.div>

            <motion.div variants={cardVariants}>
                <AnimatedDashboardCard
                    title="Completed Lessons"
                    value={stats.completedLessons || 0}
                    description="Lessons you've finished"
                    icon={<BookOpen className="w-5 h-5" />}
                    delay={0.2}
                />
            </motion.div>

            <motion.div variants={cardVariants}>
                <AnimatedDashboardCard
                    title="Achievements"
                    value={stats.achievements || 0}
                    description="Badges earned"
                    icon={<Trophy className="w-5 h-5" />}
                    delay={0.3}
                />
            </motion.div>

            <motion.div variants={cardVariants}>
                <AnimatedDashboardCard
                    title="Upcoming Events"
                    value={stats.upcomingEvents || 0}
                    description="Events on your calendar"
                    icon={<Calendar className="w-5 h-5" />}
                    delay={0.4}
                />
            </motion.div>
        </motion.div>
    );
}

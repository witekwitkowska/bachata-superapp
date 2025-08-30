"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AnimatedDashboardCardProps {
    title: string;
    value: string | number;
    description?: string;
    progress?: number;
    status?: "active" | "inactive" | "pending";
    icon?: React.ReactNode;
    delay?: number;
}

export function AnimatedDashboardCard({
    title,
    value,
    description,
    progress,
    status,
    icon,
    delay = 0,
}: AnimatedDashboardCardProps) {
    const getStatusColor = (status?: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "inactive":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.02 }}
            className="h-full"
        >
            <Card className="h-full border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {title}
                        </CardTitle>
                        {icon && (
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.6, delay: delay + 0.2 }}
                                className="text-gray-600 dark:text-gray-400"
                            >
                                {icon}
                            </motion.div>
                        )}
                    </div>
                    {status && (
                        <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                    )}
                </CardHeader>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: delay + 0.1 }}
                        className="space-y-3"
                    >
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {value}
                        </div>
                        {description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                        )}
                        {progress !== undefined && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {progress}%
                                    </span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

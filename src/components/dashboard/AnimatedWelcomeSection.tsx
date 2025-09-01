"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnimatedWelcomeSectionProps {
    userName: string;
    userRole: string;
    lastLogin?: string;
}

export function AnimatedWelcomeSection({
    userName,
    userRole,
    lastLogin,
}: AnimatedWelcomeSectionProps) {
    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            case "teacher":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "team":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
        >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <CardContent className="p-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center space-y-4 flex flex-col items-center"
                    >
                        <motion.h1
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-4xl font-bold text-gray-900 dark:text-gray-100"
                        >
                            Welcome back, {userName}!
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex items-center justify-center gap-3"
                        >
                            <Badge className={getRoleColor(userRole)}>
                                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                            </Badge>
                            {lastLogin && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Last login: {lastLogin}
                                </span>
                            )}
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                        >
                            Ready to continue your bachata journey? Check out your progress, update your profile, or explore new features below.
                        </motion.p>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

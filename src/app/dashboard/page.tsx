"use client";

import { motion } from "framer-motion";
import { User, BookOpen, GraduationCap, Home, TrendingUp, Calendar, Users, Music, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-bold">
                    Welcome to Your Dashboard
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Manage your bachata profile, track your progress, and connect with the community
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {/* Profile Status */}
                <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-lg text-gray-900 dark:text-white mb-2">
                            Profile Status
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Complete your profile to get started
                        </CardDescription>
                        <div className="mt-4">
                            <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                                <div className="h-2 rounded-full w-3/4 bg-blue-500 dark:bg-blue-400"></div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">75% Complete</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Bachata Level */}
                <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl">🌿</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-lg text-gray-900 dark:text-white mb-2">
                            Bachata Level
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Intermediate Level
                        </CardDescription>
                        <div className="mt-4">
                            <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2">
                                <div className="h-2 rounded-full w-1/2 bg-green-500 dark:bg-green-400"></div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Level 2 of 4</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Teacher Status */}
                <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-lg text-gray-900 dark:text-white mb-2">
                            Teacher Status
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Not currently a teacher
                        </CardDescription>
                        <div className="mt-4">
                            <Button variant="outline" size="sm" className="w-full">
                                Become a Teacher
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity */}
                <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl">📅</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-lg text-gray-900 dark:text-white mb-2">
                            Recent Activity
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Last login: 2 hours ago
                        </CardDescription>
                        <div className="mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Profile updated yesterday
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                <Home className="w-4 h-4 text-white" />
                            </div>
                            Quick Actions
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Get started with these common tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                onClick={() => window.location.href = "/dashboard/profile"}
                                className="h-20 text-white font-medium text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                <div className="text-center">
                                    <User className="w-6 h-6 mx-auto mb-2" />
                                    Edit Profile
                                </div>
                            </Button>
                            <Button
                                onClick={() => window.location.href = "/dashboard/bachata-level"}
                                className="h-20 text-white font-medium text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                <div className="text-center">
                                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                                    Set Level
                                </div>
                            </Button>
                            <Button
                                onClick={() => window.location.href = "/dashboard/teacher"}
                                className="h-20 text-white font-medium text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                <div className="text-center">
                                    <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                                    Teacher Setup
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Community Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            Community
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Connect with other bachata dancers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                                <Music className="w-6 h-6 mx-auto mb-2 text-white dark:text-black" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Find Dance Partners
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Connect with dancers in your area
                                </p>
                                <Button variant="outline" className="w-full">
                                    Explore
                                </Button>
                            </div>
                            <div className="text-center p-6 rounded-xl border border-green-200/50 dark:border-green-700/50">
                                <div className="text-4xl mb-4">
                                    <Trophy className="w-6 h-6 mx-auto mb-2 text-white dark:text-black" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Join Competitions
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Show your skills and compete
                                </p>
                                <Button variant="outline" className="w-full">
                                    View Events
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

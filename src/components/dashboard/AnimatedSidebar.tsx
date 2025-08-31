"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, User, Settings, BookOpen, Home, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";

const navigation = [
    { id: "overview", label: "Overview", icon: Home, href: "/dashboard" },
    { id: "profile", label: "Edit Profile", icon: User, href: "/dashboard/profile" },
    { id: "bachata-level", label: "Bachata Level", icon: BookOpen, href: "/dashboard/bachata-level" },
    { id: "teacher", label: "Teacher Status", icon: GraduationCap, href: "/dashboard/teacher" },
    { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function AnimatedSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

    return (
        <>
            {/* Mobile Menu Button */}
            <div className={`${isMobile ? "fixed" : "hidden"} top-4 left-4 z-50`}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
                >
                    {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
            </div>

            {/* Sidebar */}
            <motion.div
                initial={{ x: isMobile ? -300 : 0 }}
                animate={{ x: sidebarOpen ? 0 : isMobile ? -300 : 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`${isMobile ? "fixed inset-y-0 left-0" : ""} z-40 w-72 shadow-2xl backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-400">
                                    Dashboard
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${isActive
                                        ? "border border-blue-200/50 dark:border-blue-700/50 shadow-lg shadow-blue-500/10"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:scale-[1.02] hover:shadow-md"
                                        }`}
                                >
                                    <div
                                        className={`p-2 rounded-lg transition-all duration-300 ${isActive
                                            ? "text-white shadow-lg"
                                            : "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                                            }`}
                                    >
                                        <Icon
                                            className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600 dark:text-gray-400"
                                                }`}
                                        />
                                    </div>
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="w-2 h-2 rounded-full ml-auto"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Bachata SuperApp v1.0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`${isMobile ? "fixed inset-0 bg-black/20 backdrop-blur-sm z-30" : "hidden"
                        }`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
}

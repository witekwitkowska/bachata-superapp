"use client";;
import { useState } from "react";
import { UserTable } from "@/components/admin/UserTable";
import { UserProfile } from "@/types/user.d";
import { Users, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { handleFetch } from "@/lib/fetch";

interface UsersClientProps {
    initialUsers: UserProfile[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState<UserProfile[]>(initialUsers);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast } = useToast();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const { data, success } = await handleFetch("/api/users", "Failed to fetch users");
            if (!success) {
                throw new Error("Failed to fetch users");
            }
            setUsers(data || []);
            toast({
                title: "Success",
                description: "Users refreshed successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to refresh users",
                variant: "destructive",
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleUserUpdate = () => {
        handleRefresh();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Manage Users
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manage user accounts, roles, and permissions
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button asChild>
                        <Link href="/auth/register">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {users.length}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {users.filter(u => u.role === "admin").length}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="text-red-600 dark:text-red-400 font-bold">A</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Organizers</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {users.filter(u => u.role === "organizer").length}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">O</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Teachers</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {users.filter(u => u.isTeacher).length}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 font-bold">T</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <UserTable users={users} onUserUpdate={handleUserUpdate} />
            </div>
        </div>
    );
}

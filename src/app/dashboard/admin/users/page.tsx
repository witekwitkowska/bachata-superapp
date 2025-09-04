import { serverFetch } from "@/lib/server-fetch";
import { UsersClient } from "./users-client";
import { UserProfile } from "@/types/user.d";
import { Users } from "lucide-react";

interface UsersPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
    let users: UserProfile[] = [];
    let error: string | null = null;

    try {
        const response = await serverFetch("/api/users", "Failed to fetch users");
        users = response.data || [];
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load users";
        console.error("Error fetching users:", err);
    }

    if (error) {
        return (
            <div className="space-y-6">
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

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-8 text-center">
                        <div className="text-red-600 dark:text-red-400 mb-2">
                            <Users className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Error Loading Users</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <UsersClient initialUsers={users} />;
}

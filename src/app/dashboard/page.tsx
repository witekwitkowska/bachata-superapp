import { auth } from "@/auth";
import { AnimatedWelcomeSection } from "@/components/dashboard/AnimatedWelcomeSection";
import { AnimatedStatsGrid } from "@/components/dashboard/AnimatedStatsGrid";

export default async function DashboardPage() {
    const session = await auth();

    return (
        <div className="w-full container mx-auto px-4 py-8">
            <AnimatedWelcomeSection
                userName={session?.user?.name || "User"}
                userRole={session?.user?.role || "visitor"}
                lastLogin="Today"
            />

            <AnimatedStatsGrid stats={{
                totalClasses: 12,
                completedLessons: 8,
                achievements: 3,
                upcomingEvents: 2,
            }} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Update Profile
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Keep your information up to date
                            </p>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Edit Profile
                            </button>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                View Progress
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Track your learning journey
                            </p>
                            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                View Progress
                            </button>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Schedule Class
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Book your next lesson
                            </p>
                            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                                Book Class
                            </button>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Get Support
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Need help? Contact us
                            </p>
                            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

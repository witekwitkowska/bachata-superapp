import { AnimatedSidebar } from "@/components/dashboard/AnimatedSidebar";
import { AnimatedContentWrapper } from "@/components/dashboard/AnimatedContentWrapper";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full flex min-h-screen">
            <AnimatedSidebar />

            {/* Main Content */}
            <div className="w-full lg:ml-72 ml-0 min-h-screen">
                {/* Content Header */}
                <div className="backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-400">
                                Dashboard
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Manage your account and preferences
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Online
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <AnimatedContentWrapper>
                    {children}
                </AnimatedContentWrapper>
            </div>
        </div>
    );
}

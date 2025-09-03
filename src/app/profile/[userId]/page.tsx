import { auth } from "@/auth";
import { UserProfile } from "@/components/profile/UserProfile";
import { serverFetch } from "@/lib/server-fetch";
import { baseUrl } from "@/lib/utils";
import { notFound } from "next/navigation";

interface ProfilePageProps {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ tab?: string }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
    const { userId } = await params;
    const { tab } = await searchParams;
    const session = await auth();


    try {
        // Fetch user profile data
        const { data: profile } = await serverFetch(
            `${baseUrl}/api/users/${userId}`,
            "Failed to load profile"
        );

        // Fetch user posts
        const { data: posts } = await serverFetch(
            `${baseUrl}/api/posts?authorId=${userId}`,
            "Failed to load posts"
        );

        return (
            <UserProfile
                profile={profile}
                posts={posts || []}
                currentUserId={session?.user?.id}
                defaultTab={tab || "posts"}
            />
        );
    } catch (error) {
        notFound();
    }
}

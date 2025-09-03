import { auth } from "@/auth";
import { PostsFeed } from "@/components/posts";
import { posts } from "@/resources";
import { redirect } from "next/navigation";
import { isMobile } from "@/lib/utils";
import { headers } from "next/headers";

export const metadata = {
    title: posts.title,
    description: posts.description,
};

export default async function PostsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/auth/signin");
    }

    const receivedHeaders = await headers()
    const userAgent = receivedHeaders.get("user-agent") || "";
    const mobileCheck = isMobile(userAgent);


    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <PostsFeed session={session} isMobile={mobileCheck} />
        </div>
    );
}

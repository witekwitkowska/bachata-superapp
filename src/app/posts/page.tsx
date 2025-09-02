import { auth } from "@/auth";
import { PostsFeed } from "@/components/posts";
import { posts } from "@/resources";
import { redirect } from "next/navigation";

export const metadata = {
    title: posts.title,
    description: posts.description,
};

export default async function PostsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/auth/signin");
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <PostsFeed session={session} />
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { PostCreateForm } from "./PostCreateForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, RefreshCw } from "lucide-react";
import type { Post } from "@/types/post.types";
import { toast } from "sonner";
import { Session } from "next-auth";
import { MasonryGrid } from "@once-ui-system/core";
import { handleDelete, handleFetch, handlePost } from "@/lib/fetch";

interface PostsFeedProps {
    className?: string;
    session: Session;
    isMobile?: boolean;
}

export function PostsFeed({ className, session, isMobile }: PostsFeedProps) {
    const [posts, setPosts] = useState<(Post & { authorProfileImage: string, authorName: string, authorEmail: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchPosts = async () => {
        try {
            const { data, success } = await handleFetch("/api/posts");

            if (success) {
                // Add author information to posts
                const postsWithAuthor = data.map((post: Post & { authorProfileImage: string, authorName: string, authorEmail: string }) => ({
                    ...post,
                }));
                setPosts(postsWithAuthor);
            } else {
                toast.error("Failed to load posts");
            }
        } catch (error) {
            toast.error("An error occurred while loading posts");
            console.error("Error fetching posts:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchPosts();
    };

    const handlePostCreated = () => {
        setShowCreateForm(false);
        fetchPosts();
    };

    const handleReaction = async (postId: string, reactionType: "lightning" | "fire" | "ice") => {
        try {
            // For now, we'll just show a toast since we don't have user authentication
            if (session?.user?.id) {
                const { success, error } = await handlePost(`/api/posts/${postId}/react`, {
                    reactionType,
                    userId: session.user.id,
                });
                if (success) {
                    toast.success(`You reacted with ${reactionType}!`);
                } else {
                    toast.error(error || "Failed to add reaction");
                }
            }
        } catch (error) {
            toast.error("Failed to add reaction");
            console.error("Error adding reaction:", error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        try {
            const { success, error } = await handleDelete(`/api/posts/${postId}`, "Failed to delete post");

            if (success) {
                toast.success("Post deleted successfully!");
                fetchPosts(); // Refresh the posts list
            } else {
                toast.error(error || "Failed to delete post");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the post");
            console.error("Error deleting post:", error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (isLoading) {
        return (
            <div className={`space-y-6 ${className}`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Posts</h2>
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                    </Button>
                </div>

                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-6 space-y-4">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full space-y-6 ${className ? className : ""}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold">Posts</h2>
                    <Button
                        className="ml-8"
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
                <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                </Button>
            </div>

            {showCreateForm && (
                <PostCreateForm onPostCreated={handlePostCreated} session={session} />
            )}

            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No posts yet</p>
                    <p className="text-muted-foreground text-sm mt-2">
                        Be the first to share something with the community!
                    </p>
                </div>
            ) : (
                <div className="w-full space-y-6">
                    <MasonryGrid columns={isMobile ? 1 : 3}>
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onReaction={handleReaction}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </MasonryGrid>
                </div>
            )}
        </div>
    );
}

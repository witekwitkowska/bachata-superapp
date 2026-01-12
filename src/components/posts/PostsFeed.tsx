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
import { ChronologicalMasonry } from "./ChronologicalMasonry";
import { DateGroupedMasonry } from "./DateGroupedMasonry";

interface PostsFeedProps {
    className?: string;
    session: Session;
    isMobile?: boolean;
    layoutType?: "chronological" | "grouped" | "standard";
    enablePagination?: boolean;
    postsPerPage?: number;
}

export function PostsFeed({
    className,
    session,
    isMobile,
    layoutType = "chronological",
    enablePagination = false,
    postsPerPage = 20
}: PostsFeedProps) {
    const [posts, setPosts] = useState<(Post & { authorProfileImage: string, authorName: string, authorEmail: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePosts, setHasMorePosts] = useState(true);

    const fetchPosts = async (page: number = 1, append: boolean = false) => {
        try {
            const url = enablePagination
                ? `/api/posts?page=${page}&limit=${postsPerPage}`
                : "/api/posts";

            const { data, success } = await handleFetch(url);

            if (success) {
                // Add author information to posts
                const postsWithAuthor = data.posts?.map((post: Post & { authorProfileImage: string, authorName: string, authorEmail: string }) => ({
                    ...post,
                })) || data.map((post: Post & { authorProfileImage: string, authorName: string, authorEmail: string }) => ({
                    ...post,
                }));

                if (append) {
                    setPosts(prev => [...prev, ...postsWithAuthor]);
                } else {
                    setPosts(postsWithAuthor);
                }

                // Check if there are more posts for pagination
                if (enablePagination && data.posts) {
                    setHasMorePosts(data.posts.length === postsPerPage);
                }
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
        setCurrentPage(1);
        await fetchPosts(1, false);
    };

    const handleLoadMore = async () => {
        if (!hasMorePosts) return;

        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        await fetchPosts(nextPage, true);
    };

    const handlePostCreated = () => {
        setShowCreateForm(false);
        fetchPosts();
    };

    const handleReaction = async (postId: string, reactionType: "lightning" | "fire" | "ice") => {
        try {
            if (session?.user?.id) {
                const { success, error, data } = await handlePost(`/api/posts/${postId}/react`, {
                    reactionType,
                });
                if (success) {
                    const reactionEmoji = reactionType === "lightning" ? "⚡" : reactionType === "fire" ? "🔥" : "❄️";
                    const action = data?.hasReacted ? "added" : "removed";
                    toast.success(`${reactionEmoji} Reaction ${action}!`);
                    // Refresh posts to show updated reaction counts
                    await fetchPosts(currentPage, false);
                } else {
                    toast.error(error || "Failed to add reaction");
                }
            } else {
                toast.error("Please sign in to react to posts");
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
                    {layoutType === "chronological" ? (
                        <ChronologicalMasonry
                            posts={posts}
                            columns={isMobile ? 1 : 3}
                            onReaction={handleReaction}
                            onDelete={handleDeletePost}
                        />
                    ) : layoutType === "grouped" ? (
                        <DateGroupedMasonry
                            posts={posts}
                            columns={isMobile ? 1 : 3}
                            onReaction={handleReaction}
                            onDelete={handleDeletePost}
                        />
                    ) : (
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
                    )}

                    {/* Load More Button */}
                    {enablePagination && hasMorePosts && (
                        <div className="flex justify-center pt-6">
                            <Button
                                onClick={handleLoadMore}
                                variant="outline"
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "Load More Posts"}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { PostCard } from "./PostCard";
import type { Post } from "@/types/post.types";

interface ChronologicalMasonryProps {
    posts: (Post & { authorProfileImage: string; authorName: string; authorEmail: string })[];
    columns: number;
    onReaction: (postId: string, reactionType: "lightning" | "fire" | "ice") => void;
    onDelete: (postId: string) => void;
    className?: string;
}

interface ColumnData {
    posts: (Post & { authorProfileImage: string; authorName: string; authorEmail: string })[];
    totalHeight: number;
}

// Estimate post height based on content
const estimatePostHeight = (post: Post & { authorProfileImage: string; authorName: string; authorEmail: string }) => {
    let height = 120; // Base height for author info and actions

    // Add height for caption
    const captionLines = Math.ceil(post.caption.length / 50); // Rough estimate
    height += captionLines * 20;

    // Add height for images
    if (post.images && post.images.length > 0) {
        height += 200; // Base image height
        if (post.images.length > 1) {
            height += (post.images.length - 1) * 150; // Additional images
        }
    }

    // Add height for reactions
    const totalReactions = (post.lightnings?.length || 0) + (post.fires?.length || 0) + (post.ices?.length || 0);
    if (totalReactions > 0) {
        height += 40;
    }

    return height;
};

export function ChronologicalMasonry({
    posts,
    columns,
    onReaction,
    onDelete,
    className
}: ChronologicalMasonryProps) {
    const [columnHeights, setColumnHeights] = useState<number[]>(new Array(columns).fill(0));
    const [distributedPosts, setDistributedPosts] = useState<ColumnData[]>([]);

    // Sort posts by creation date (newest first)
    const sortedPosts = useMemo(() => {
        return [...posts].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [posts]);

    // Distribute posts across columns maintaining chronological order
    const distributePosts = useMemo(() => {
        const columnData: ColumnData[] = Array.from({ length: columns }, () => ({
            posts: [],
            totalHeight: 0
        }));

        // For each post, find the column with the shortest height
        sortedPosts.forEach((post) => {
            const shortestColumnIndex = columnData.reduce((shortest, current, index) =>
                current.totalHeight < columnData[shortest].totalHeight ? index : shortest, 0
            );

            // Add post to the shortest column
            columnData[shortestColumnIndex].posts.push(post);

            // Estimate height (you can make this more sophisticated)
            const estimatedHeight = estimatePostHeight(post);
            columnData[shortestColumnIndex].totalHeight += estimatedHeight;
        });

        return columnData;
    }, [sortedPosts, columns]);

    useEffect(() => {
        setDistributedPosts(distributePosts);
    }, [distributePosts]);

    if (sortedPosts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No posts yet</p>
                <p className="text-muted-foreground text-sm mt-2">
                    Be the first to share something with the community!
                </p>
            </div>
        );
    }

    return (
        <div className={`grid gap-6 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {distributedPosts.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-6">
                    {column.posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onReaction={onReaction}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

"use client";

import { useMemo } from "react";
import { PostCard } from "./PostCard";
import { MasonryGrid } from "@once-ui-system/core";
import type { Post } from "@/types/post.types";

interface DateGroupedMasonryProps {
    posts: (Post & { authorProfileImage: string; authorName: string; authorEmail: string })[];
    columns: number;
    onReaction: (postId: string, reactionType: "lightning" | "fire" | "ice") => void;
    onDelete: (postId: string) => void;
    className?: string;
}

interface GroupedPosts {
    [date: string]: (Post & { authorProfileImage: string; authorName: string; authorEmail: string })[];
}

export function DateGroupedMasonry({
    posts,
    columns,
    onReaction,
    onDelete,
    className
}: DateGroupedMasonryProps) {
    // Group posts by date
    const groupedPosts = useMemo(() => {
        const groups: GroupedPosts = {};

        // Sort posts by creation date (newest first)
        const sortedPosts = [...posts].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        sortedPosts.forEach((post) => {
            const date = new Date(post.createdAt).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(post);
        });

        return groups;
    }, [posts]);

    // Get sorted dates (newest first)
    const sortedDates = useMemo(() => {
        return Object.keys(groupedPosts).sort((a, b) =>
            new Date(b).getTime() - new Date(a).getTime()
        );
    }, [groupedPosts]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    if (sortedDates.length === 0) {
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
        <div className={`space-y-8 ${className}`}>
            {sortedDates.map((date) => (
                <div key={date} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            {formatDate(date)}
                        </h3>
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-sm text-muted-foreground">
                            {groupedPosts[date].length} post{groupedPosts[date].length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <MasonryGrid columns={columns}>
                        {groupedPosts[date].map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onReaction={onReaction}
                                onDelete={onDelete}
                            />
                        ))}
                    </MasonryGrid>
                </div>
            ))}
        </div>
    );
}

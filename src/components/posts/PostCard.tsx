"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Post } from "@/types/post.types";
import { PostHeader } from "./PostHeader";
import { PostImages } from "./PostImages";
import { PostReactions } from "./PostReactions";
import { PostTags } from "./PostTags";

interface PostCardProps {
    post: Post & { authorProfileImage: string, authorName: string, authorEmail: string };
    onReaction?: (postId: string, reactionType: "lightning" | "fire" | "ice") => void;
    onDelete?: (postId: string) => void;
    className?: string;
}

export function PostCard({ post, onReaction, onDelete, className }: PostCardProps) {
    return (
        <Card className={`w-full ${className}`}>
            <CardHeader className="pb-3">
                <PostHeader post={post} onDelete={onDelete} />
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Caption */}
                <p className="text-sm leading-relaxed">{post.caption}</p>

                {/* Tags */}
                <PostTags tags={post.tags || []} />

                {/* Images */}
                <PostImages images={post.images || []} />

                {/* Reactions */}
                <PostReactions post={post} onReaction={onReaction} />
            </CardContent>
        </Card>
    );
}
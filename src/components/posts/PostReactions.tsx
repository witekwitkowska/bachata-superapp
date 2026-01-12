"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Flame, Snowflake, MessageCircle, Share } from "lucide-react";
import type { Post } from "@/types/post.types";
import { useSession } from "next-auth/react";

interface PostReactionsProps {
    post: Post;
    onReaction?: (postId: string, reactionType: "lightning" | "fire" | "ice") => void;
}

export function PostReactions({ post, onReaction }: PostReactionsProps) {
    const { data: session } = useSession();
    const [isReacting, setIsReacting] = useState(false);

    const handleReaction = async (reactionType: "lightning" | "fire" | "ice") => {
        if (isReacting) return;

        setIsReacting(true);
        try {
            await onReaction?.(post.id, reactionType);
        } finally {
            setIsReacting(false);
        }
    };

    const hasReactions = post.lightnings.length > 0 || post.fires.length > 0 || post.ices.length > 0;
    
    // Check if current user has reacted
    const userHasLightning = session?.user?.id && post.lightnings.some((r: any) => r.userId === session.user.id);
    const userHasFire = session?.user?.id && post.fires.some((r: any) => r.userId === session.user.id);
    const userHasIce = session?.user?.id && post.ices.some((r: any) => r.userId === session.user.id);

    return (
        <div className="space-y-3">
            {/* Reaction Buttons */}
            <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-1">
                    {/* Lightning */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction("lightning")}
                        disabled={isReacting || !session?.user?.id}
                        className={`flex items-center space-x-1 ${
                            userHasLightning 
                                ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" 
                                : "text-yellow-500 hover:text-yellow-600"
                        }`}
                    >
                        <Zap className={`h-4 w-4 ${userHasLightning ? "fill-current" : ""}`} />
                        <span className="text-xs">{post.lightnings.length}</span>
                    </Button>

                    {/* Fire */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction("fire")}
                        disabled={isReacting || !session?.user?.id}
                        className={`flex items-center space-x-1 ${
                            userHasFire 
                                ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20" 
                                : "text-orange-500 hover:text-orange-600"
                        }`}
                    >
                        <Flame className={`h-4 w-4 ${userHasFire ? "fill-current" : ""}`} />
                        <span className="text-xs">{post.fires.length}</span>
                    </Button>

                    {/* Ice */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction("ice")}
                        disabled={isReacting || !session?.user?.id}
                        className={`flex items-center space-x-1 ${
                            userHasIce 
                                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                                : "text-blue-500 hover:text-blue-600"
                        }`}
                    >
                        <Snowflake className={`h-4 w-4 ${userHasIce ? "fill-current" : ""}`} />
                        <span className="text-xs">{post.ices.length}</span>
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Reaction Details */}
            {hasReactions && (
                <div className="space-y-2 text-xs text-muted-foreground">
                    {post.lightnings.length > 0 && (
                        <div className="flex items-center space-x-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span>
                                {post.lightnings.map(l => l.name).join(", ")}
                                {post.lightnings.length > 3 && ` and ${post.lightnings.length - 3} others`}
                            </span>
                        </div>
                    )}
                    {post.fires.length > 0 && (
                        <div className="flex items-center space-x-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>
                                {post.fires.map(f => f.name).join(", ")}
                                {post.fires.length > 3 && ` and ${post.fires.length - 3} others`}
                            </span>
                        </div>
                    )}
                    {post.ices.length > 0 && (
                        <div className="flex items-center space-x-1">
                            <Snowflake className="h-3 w-3 text-blue-500" />
                            <span>
                                {post.ices.map(i => i.name).join(", ")}
                                {post.ices.length > 3 && ` and ${post.ices.length - 3} others`}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

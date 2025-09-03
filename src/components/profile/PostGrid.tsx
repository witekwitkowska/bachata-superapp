"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Heart,
    Zap,
    Snowflake, Calendar,
    MapPin
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@/types/post.types";

interface PostGridProps {
    posts: (Post & {
        authorProfileImage: string;
        authorName: string;
        authorEmail: string;
    })[];
}

export function PostGrid({ posts }: PostGridProps) {
    const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return "Unknown time";
        }
    };

    const getTotalReactions = (post: typeof posts[0]) => {
        return (post.lightnings?.length || 0) + (post.fires?.length || 0) + (post.ices?.length || 0);
    };

    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No images to show</h3>
                <p className="text-muted-foreground">This user hasn't shared any images yet.</p>
            </div>
        );
    }

    // Filter posts that have images
    const postsWithImages = posts.filter(post => post.images && post.images.length > 0);

    if (postsWithImages.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No images to show</h3>
                <p className="text-muted-foreground">This user hasn't shared any images yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {postsWithImages.map((post) => (
                    <div key={post.id} className="group relative">
                        <Card
                            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                            onClick={() => setSelectedPost(post)}
                        >
                            <div className="aspect-square relative">
                                <img
                                    src={post.images[0]}
                                    alt={post.caption || "Post image"}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                                {/* Overlay content */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="flex items-center space-x-4 text-white">
                                        <div className="flex items-center space-x-1">
                                            <Zap className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {post.lightnings?.length || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Heart className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {post.fires?.length || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Snowflake className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {post.ices?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Multiple images indicator */}
                                {post.images.length > 1 && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="bg-black/50 text-white border-0">
                                            {post.images.length}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Post Detail Modal */}
            <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedPost && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center space-x-3">
                                    <img
                                        src={selectedPost.authorProfileImage}
                                        alt={selectedPost.authorName}
                                        className="h-8 w-8 rounded-full"
                                    />
                                    <span>{selectedPost.authorName}</span>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Images */}
                                {selectedPost.images && selectedPost.images.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedPost.images.map((image, index) => (
                                            <div key={index} className="aspect-square">
                                                <img
                                                    src={image}
                                                    alt={`${selectedPost.caption} - Image ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Caption */}
                                {selectedPost.caption && (
                                    <p className="text-sm leading-relaxed">{selectedPost.caption}</p>
                                )}

                                {/* Tags */}
                                {selectedPost.tags && selectedPost.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPost.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Post Info */}
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(selectedPost.createdAt)}</span>
                                        </div>
                                        {selectedPost.location && (
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{selectedPost.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <Zap className="h-4 w-4" />
                                            <span>{selectedPost.lightnings?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Heart className="h-4 w-4" />
                                            <span>{selectedPost.fires?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Snowflake className="h-4 w-4" />
                                            <span>{selectedPost.ices?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

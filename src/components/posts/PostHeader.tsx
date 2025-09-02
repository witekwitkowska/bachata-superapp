"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, MoreHorizontal, Trash2 } from "lucide-react";
import type { Post } from "@/types/post.types";
import { formatDistanceToNow } from "date-fns";

interface PostHeaderProps {
    post: Post & { authorProfileImage: string, authorName: string, authorEmail: string };
    onDelete?: (postId: string) => void;
}

export function PostHeader({ post, onDelete }: PostHeaderProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return "Unknown time";
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete?.(post.id);
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                    {post.authorProfileImage && <AvatarImage src={post.authorProfileImage} alt="Author" />}
                    {post.authorName && <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>}
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{post.authorName}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                        {post.location && (
                            <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{post.location}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                    <div className="space-y-1">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Post
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this post? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

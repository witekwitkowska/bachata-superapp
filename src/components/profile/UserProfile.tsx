"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Globe,
    Calendar,
    Users,
    Star,
    Music,
    Camera,
    Grid3X3,
    List,
    Heart
} from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { PostGrid } from "@/components/profile/PostGrid";
import type { UserProfile as UserProfileType } from "@/types/user";
import type { Post } from "@/types/post.types";
import { formatDistanceToNow } from "date-fns";
import { getInitials } from "@/lib/utils";

interface UserProfileProps {
    profile: UserProfileType & {
        role?: string;
        isTeacher?: boolean;
        createdAt?: string;
        postsCount?: number;
        followersCount?: number;
        followingCount?: number;
    };
    posts: (Post & {
        authorProfileImage: string;
        authorName: string;
        authorEmail: string;
    })[];
    currentUserId?: string;
    defaultTab?: string;
}

export function UserProfile({ profile, posts, currentUserId, defaultTab = "posts" }: UserProfileProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const getUserType = () => {
        if (profile.role === "admin") return { type: "admin", label: "Admin", color: "bg-purple-100 text-purple-800", icon: Star };
        if (profile.isTeacher || profile.role === "teacher") return { type: "artist", label: "Artist", color: "bg-pink-100 text-pink-800", icon: Music };
        if (profile.role === "organizer") return { type: "organizer", label: "Organizer", color: "bg-blue-100 text-blue-800", icon: Users };
        return { type: "dancer", label: "Dancer", color: "bg-green-100 text-green-800", icon: Heart };
    };

    const userType = getUserType();
    const isOwnProfile = currentUserId === profile.id;
    const profileImage = profile.avatars?.[0] || profile.gallery?.[0];
    const bannerImage = profile.banners?.[0];



    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return "Unknown time";
        }
    };

    const handleReaction = async (postId: string, reactionType: "lightning" | "fire" | "ice") => {
        // Handle post reactions
        console.log("Reaction:", { postId, reactionType });
    };

    const handleDelete = async (postId: string) => {
        // Handle post deletion
        console.log("Delete post:", postId);
    };

    return (
        <div className="lg:w-1/2 w-full mx-auto min-h-screen bg-transparent">
            {/* Banner */}
            <div className="relative h-64 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 overflow-hidden rounded-lg">
                {bannerImage ? (
                    <img
                        src={bannerImage}
                        alt="Profile banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600" />
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-10">
                {/* Profile Header */}
                <Card className="mb-6 shadow-lg border-0 bg-background backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
                            {/* Avatar */}
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                    {profileImage && (
                                        <AvatarImage
                                            src={profileImage}
                                            alt={`${profile.name}'s profile`}
                                        />
                                    )}
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                        {getInitials(profile.name)}
                                    </AvatarFallback>
                                </Avatar>
                                {/* User Type Badge */}
                                <div className="absolute -bottom-2 -right-2">
                                    <Badge className={`${userType.color} border-2 border-background shadow-lg flex items-center gap-1 hover:scale-105 transition-transform duration-200`}>
                                        <userType.icon className="h-3 w-3" />
                                        {userType.label}
                                    </Badge>
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                                    <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                                        {profile.location && (
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                        {profile.website && (
                                            <div className="flex items-center space-x-1">
                                                <Globe className="h-4 w-4" />
                                                <a
                                                    href={profile.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    Website
                                                </a>
                                            </div>
                                        )}
                                        {profile.createdAt && (
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Joined {formatDate(profile.createdAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                {profile.bio && (
                                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                        {profile.bio}
                                    </p>
                                )}

                                {/* Bachata Level */}
                                {profile.bachataLevel && (
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Music className="h-3 w-3" />
                                            {profile.bachataLevel.charAt(0).toUpperCase() + profile.bachataLevel.slice(1)} Level
                                        </Badge>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center space-x-6 pt-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{posts.length}</div>
                                        <div className="text-sm text-muted-foreground">Posts</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{profile.followersCount || 0}</div>
                                        <div className="text-sm text-muted-foreground">Followers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{profile.followingCount || 0}</div>
                                        <div className="text-sm text-muted-foreground">Following</div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!isOwnProfile && (
                                    <div className="flex space-x-3 pt-4">
                                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                                            Follow
                                        </Button>
                                        <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 transition-all duration-200">
                                            Message
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Posts Section */}
                <Card className="shadow-lg border-0 bg-transparent backdrop-blur-sm">
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="sticky top-0 z-1 grid w-full grid-cols-2 rounded-lg border-b px-8 h-16 py-8">
                                <TabsTrigger value="posts" className="flex items-center gap-2 h-full">
                                    <List className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="gallery" className="flex items-center gap-2 h-full">
                                    <Grid3X3 className="h-4 w-4" />
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="posts" className="p-6">
                                {posts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                                        <p className="text-muted-foreground">
                                            {isOwnProfile ? "Start sharing your bachata journey!" : "This user hasn't shared any posts yet."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {posts.map((post) => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                onReaction={handleReaction}
                                                onDelete={isOwnProfile ? handleDelete : undefined}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="gallery" className="p-6">
                                <PostGrid posts={posts} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

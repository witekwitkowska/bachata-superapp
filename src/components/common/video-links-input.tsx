"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { VideoLink, createVideoLink, isValidVideoUrl, extractInstagramId } from "@/lib/video-utils";
import dynamic from "next/dynamic";

// Dynamic imports for video players
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
const InstagramEmbed = dynamic(() => import("react-social-media-embed").then(mod => ({ default: mod.InstagramEmbed })), { ssr: false });

interface VideoLinksInputProps {
    value?: VideoLink[];
    onChange: (links: VideoLink[]) => void;
    label?: string;
    placeholder?: string;
    maxLinks?: number;
    showPreview?: boolean;
}

export function VideoLinksInput({
    value = [],
    onChange,
    label = "Video Links",
    placeholder = "Enter YouTube or Instagram video URL...",
    maxLinks = 10,
    showPreview = true
}: VideoLinksInputProps) {
    const [newUrl, setNewUrl] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleAddLink = () => {
        if (!newUrl.trim()) return;

        const trimmedUrl = newUrl.trim();

        // Validate URL
        if (!isValidVideoUrl(trimmedUrl)) {
            setErrors(prev => ({ ...prev, newUrl: "Please enter a valid YouTube or Instagram video URL" }));
            return;
        }

        // Check if URL already exists
        if (value.some(link => link.url === trimmedUrl)) {
            setErrors(prev => ({ ...prev, newUrl: "This video link already exists" }));
            return;
        }

        // Check max links limit
        if (value.length >= maxLinks) {
            setErrors(prev => ({ ...prev, newUrl: `Maximum ${maxLinks} video links allowed` }));
            return;
        }

        // Add new link
        const newLink = createVideoLink(trimmedUrl);
        onChange([...value, newLink]);
        setNewUrl("");
        setErrors(prev => ({ ...prev, newUrl: "" }));
    };

    const handleRemoveLink = (id: string) => {
        onChange(value.filter(link => link.id !== id));
    };

    const handleUrlChange = (url: string) => {
        setNewUrl(url);
        if (errors.newUrl) {
            setErrors(prev => ({ ...prev, newUrl: "" }));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddLink();
        }
    };

    const renderVideoPreview = (link: VideoLink) => {
        if (!showPreview) return null;

        try {
            if (link.type === "youtube") {
                if (link.url) {
                    return (
                        <div className="mt-2">
                            <ReactPlayer
                                src={link.url}
                                width="100%"
                                height="200px"
                                controls
                                light
                            />
                        </div>
                    );
                }
            } else if (link.type === "instagram") {
                const postId = extractInstagramId(link.url);
                if (postId) {
                    return (
                        <div className="mt-2">
                            <InstagramEmbed
                                url={link.url}
                                width={328}
                                height={328}
                                captioned
                            />
                        </div>
                    );
                }
            }
        } catch (error) {
            console.error("Error rendering video preview:", error);
        }

        return null;
    };

    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium">{label}</Label>

            {/* Add new link input */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        value={newUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        className={errors.newUrl ? "border-red-500" : ""}
                    />
                    {errors.newUrl && (
                        <p className="text-sm text-red-500 mt-1">{errors.newUrl}</p>
                    )}
                </div>
                <Button
                    type="button"
                    onClick={handleAddLink}
                    disabled={!newUrl.trim() || value.length >= maxLinks}
                    size="sm"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Video links list */}
            {value.length > 0 && (
                <div className="space-y-3">
                    {value.map((link) => (
                        <Card key={link.id} className="p-3">
                            <CardContent className="p-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={link.type === "youtube" ? "destructive" : "secondary"}>
                                                {link.type === "youtube" ? "YouTube" : "Instagram"}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(link.url, "_blank")}
                                                className="h-6 px-2"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground break-all">
                                            {link.url}
                                        </p>
                                        {renderVideoPreview(link)}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveLink(link.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Helper text */}
            <p className="text-xs text-muted-foreground">
                {value.length}/{maxLinks} video links added. Supports YouTube and Instagram videos.
            </p>
        </div>
    );
}

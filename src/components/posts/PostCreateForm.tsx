"use client";

import { useState, useEffect } from "react";
import { postSchema } from "@/lib/zod";
import type { PostInput } from "@/types/post.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { ConfigurableForm } from "@/components/common/configurable-form";
import { Session } from "next-auth";
import { handleFetch } from "@/lib/fetch";

interface PostCreateFormProps {
    onPostCreated?: () => void;
    className?: string;
    session: Session | null;
}

export function PostCreateForm({ onPostCreated, className, session }: PostCreateFormProps) {
    const [tagsOptions, setTagsOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);

    const defaultValues: PostInput = {
        authorId: session?.user?.id || "",
        caption: "",
        images: [],
        lightnings: [],
        fires: [],
        ices: [],
        published: true,
        tags: [],
        location: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const displayNames: Record<string, string> = {
        caption: "Caption",
        images: "Images",
        tags: "Tags",
        location: "Location",
        published: "Published",
    };

    // Fetch tags for the multiselector
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data, success } = await handleFetch("/api/website-elements/tags", "Failed to fetch tags");

                if (success && data) {
                    const tags = data.map((tag: any) => ({
                        value: tag.name,
                        label: tag.name.charAt(0).toUpperCase() + tag.name.slice(1)
                    }));
                    setTagsOptions(tags);
                } else {
                    // Fallback to common bachata tags if API fails
                    setTagsOptions([
                        { value: "bachata", label: "Bachata" },
                        { value: "sensual", label: "Sensual" },
                        { value: "dominican", label: "Dominican" },
                        { value: "traditional", label: "Traditional" },
                        { value: "workshop", label: "Workshop" },
                        { value: "social", label: "Social" },
                        { value: "festival", label: "Festival" },
                        { value: "beginner", label: "Beginner" },
                        { value: "intermediate", label: "Intermediate" },
                        { value: "advanced", label: "Advanced" },
                        { value: "barcelona", label: "Barcelona" },
                        { value: "spain", label: "Spain" },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching tags:", error);
                // Fallback to common bachata tags
                setTagsOptions([
                    { value: "bachata", label: "Bachata" },
                    { value: "sensual", label: "Sensual" },
                    { value: "dominican", label: "Dominican" },
                    { value: "traditional", label: "Traditional" },
                    { value: "workshop", label: "Workshop" },
                    { value: "social", label: "Social" },
                    { value: "festival", label: "Festival" },
                    { value: "beginner", label: "Beginner" },
                    { value: "intermediate", label: "Intermediate" },
                    { value: "advanced", label: "Advanced" },
                    { value: "barcelona", label: "Barcelona" },
                    { value: "spain", label: "Spain" },
                ]);
            } finally {
                setIsLoadingTags(false);
            }
        };

        fetchTags();
    }, []);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Create New Post
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingTags ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-muted-foreground">Loading tags...</div>
                    </div>
                ) : (
                    <ConfigurableForm
                        formSchema={postSchema}
                        endpoint="/posts"
                        entityName="post"
                        displayNames={displayNames}
                        defaultValues={defaultValues}
                        buttonTitle="Create Post"
                        loadingTitle="Creating Post..."
                        onFormSuccess={onPostCreated}
                        imagesList={["images"]}
                        multiSelectorList={["tags"]}
                        switchList={["published"]}
                        exclusionList={["authorId", "lightnings", "fires", "ices", "createdAt", "updatedAt", 'location']}
                        optionsMap={{
                            tags: tagsOptions
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}

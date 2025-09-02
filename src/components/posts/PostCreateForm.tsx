"use client";

import { postSchema } from "@/lib/zod";
import type { PostInput } from "@/types/post.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { ConfigurableForm } from "@/components/common/configurable-form";
import { Session } from "next-auth";

interface PostCreateFormProps {
    onPostCreated?: () => void;
    className?: string;
    session: Session;
}

export function PostCreateForm({ onPostCreated, className, session }: PostCreateFormProps) {
    const defaultValues: PostInput = {
        authorId: session?.user?.id,
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

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Create New Post
                </CardTitle>
            </CardHeader>
            <CardContent>
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
                />
            </CardContent>
        </Card>
    );
}

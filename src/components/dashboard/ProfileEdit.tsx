"use client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Session } from "next-auth";
import { ConfigurableForm } from "@/components/common/configurable-form";
import { userEditImagesSchema, userEditSchema } from "@/lib/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadWithPreview } from "../image-upload-with-preview";
import type { UserProfile } from "@/types/user";
import { useCallback, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormWrapper, type FormWrapperRef } from "../common/form-wrapper";

const editProfileOptionsMap = {
    bachataLevel: [{
        value: "beginner",
        label: "Beginner",
    }, {
        value: "intermediate",
        label: "Intermediate",
    }, {
        value: "advanced",
        label: "Advanced",
    }, {
        value: "expert",
        label: "Expert",
    }],
}

interface ProfileEditProps {
    session: Session;
    profile: UserProfile;
    defaultTab: string;
}

export function ProfileEdit({ session, profile, defaultTab }: ProfileEditProps) {
    const [activeTab, setActiveTab] = useState<string>(defaultTab);
    const router = useRouter();
    const handleSetActiveTab = (tab: string) => {
        router.push(`/dashboard/profile?tab=${tab}`);
        setActiveTab(tab);
    };

    const formWrapperRef = useRef<FormWrapperRef>(null);
    const [formValues, setFormValues] = useState({
        banners: profile.banners || [],
        avatars: profile.avatars || [],
        gallery: profile.gallery || [],
    });

    const updateFormState = useCallback((field: string, value: unknown) => {
        formWrapperRef.current?.setValue(field, value, { shouldValidate: true, shouldDirty: true });
        // Also update local state to ensure the component gets updated values
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Sync form values when profile changes
    useEffect(() => {
        setFormValues({
            banners: profile.banners || [],
            avatars: profile.avatars || [],
            gallery: profile.gallery || [],
        });
    }, [profile]);

    console.log(profile, 'profile');

    return (
        <Tabs value={activeTab} onValueChange={handleSetActiveTab}>
            <TabsList>
                <TabsTrigger value="information">Information</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>
            <TabsContent value="information">
                <Card>
                    <CardContent className="p-6">
                        <ConfigurableForm
                            className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-end"
                            formSchema={userEditSchema}
                            endpoint={`users/${profile.id}`}
                            endpointType="PATCH"
                            entityName="user"
                            displayNames={{
                                name: "Name",
                                email: "Email",
                                bio: "Bio",
                                location: "Location",
                                website: "Website",
                                bachataLevel: "Bachata Level",
                                isPublic: "Public",
                            }}
                            selectorList={["bachataLevel"]}
                            optionsMap={editProfileOptionsMap}
                            defaultValues={{
                                name: profile?.name || "",
                                email: profile?.email || "",
                                bio: profile?.bio || "",
                                location: profile?.location || "",
                                website: profile?.website || "",
                                bachataLevel: profile?.bachataLevel || "beginner",
                                isPublic: profile?.isPublic || false,
                            }}
                            switchList={["isPublic"]}
                            extraData={{
                                id: profile.id.toString(),
                            }}
                            buttonTitle="Save"
                            headerTitle="Profile"
                            loadingTitle="Saving..."
                            onSuccess={() => {
                                toast.success("Profile updated successfully");
                            }}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="images">
                <Card>
                    <CardContent className="p-6">
                        <FormWrapper
                            ref={formWrapperRef}
                            endpoint={`users/${profile.id}`}
                            endpointType="PATCH"
                            entityName="user"
                            buttonTitle="Save"
                            formSchema={userEditImagesSchema}
                            defaultValues={formValues}
                            extraData={{
                                id: profile.id.toString(),
                            }}
                            onError={(error) => {
                                toast.error("Error updating images");
                            }}
                            onSuccess={() => {
                                toast.success("Images updated successfully");
                            }}
                        >
                            {[{
                                label: "Banner",
                                value: "banners",
                            }, {
                                label: "Avatar",
                                value: "avatars",
                            }, {
                                label: "Gallery",
                                value: "gallery",
                            }].map((item) => (
                                <div className="space-y-4" key={item.value}>
                                    <h2 className="text-2xl font-bold">{item.label}</h2>
                                    <ImageUploadWithPreview
                                        onImagesChange={(images) => {
                                            updateFormState(item.value, images);
                                        }}
                                        existingImages={formValues[item.value as keyof typeof formValues]}
                                        maxImages={15}
                                        multiple
                                        showExistingImages
                                        allowRemoveExisting
                                        allowReordering
                                    />
                                </div>))}
                        </FormWrapper>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs >

    );
}

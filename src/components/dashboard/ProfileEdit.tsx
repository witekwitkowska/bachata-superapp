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
                <div className="space-y-6">
                    {/* Current Profile Preview */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 bg-gray-100">
                                        {formValues.avatars && formValues.avatars.length > 0 ? (
                                            <img
                                                src={formValues.avatars[0]}
                                                alt="Current Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">Current Profile Picture</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formValues.avatars && formValues.avatars.length > 0
                                            ? "This is your current avatar that others will see on your profile."
                                            : "No avatar set. Upload an image below to set your profile picture."
                                        }
                                    </p>
                                    {formValues.avatars && formValues.avatars.length > 0 && (
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ✓ Active Avatar
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Image Management */}
                    <Card>
                        <CardContent className="p-6">
                            <FormWrapper
                                ref={formWrapperRef}
                                endpoint={`users/${profile.id}`}
                                endpointType="PATCH"
                                entityName="user"
                                buttonTitle="Save Changes"
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
                                <div className="space-y-8">
                                    {/* Avatar Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-gray-900">Profile Picture</h2>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Most Recent = Active
                                            </span>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-blue-900">How it works</h4>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        The most recently uploaded image will automatically become your active profile picture.
                                                        You can reorder images by dragging them - the first image in the list will be your profile picture.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <ImageUploadWithPreview
                                            onImagesChange={(images) => {
                                                updateFormState("avatars", images);
                                            }}
                                            existingImages={formValues.avatars}
                                            maxImages={5}
                                            multiple
                                            showExistingImages
                                            allowRemoveExisting
                                            allowReordering
                                            allowProfilePhotoSelection
                                            currentProfilePhoto={formValues.avatars && formValues.avatars.length > 0 ? formValues.avatars[0] : ""}
                                            onProfilePhotoChange={(imageUrl) => {
                                                if (imageUrl && formValues.avatars) {
                                                    // Move selected image to front
                                                    const newAvatars = [imageUrl, ...formValues.avatars.filter(url => url !== imageUrl)];
                                                    updateFormState("avatars", newAvatars);
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Banner Section */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900">Banner Images</h2>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">Banner Images</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        These images appear in your profile gallery and can be used for posts and events.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <ImageUploadWithPreview
                                            onImagesChange={(images) => {
                                                updateFormState("banners", images);
                                            }}
                                            existingImages={formValues.banners}
                                            maxImages={10}
                                            multiple
                                            showExistingImages
                                            allowRemoveExisting
                                            allowReordering
                                        />
                                    </div>

                                    {/* Gallery Section */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">Photo Gallery</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Additional photos for your profile. These can be used in posts and shared with the community.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <ImageUploadWithPreview
                                            onImagesChange={(images) => {
                                                updateFormState("gallery", images);
                                            }}
                                            existingImages={formValues.gallery}
                                            maxImages={15}
                                            multiple
                                            showExistingImages
                                            allowRemoveExisting
                                            allowReordering
                                        />
                                    </div>
                                </div>
                            </FormWrapper>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs >

    );
}

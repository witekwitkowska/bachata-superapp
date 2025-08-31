"use client";;
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Session } from "next-auth";
import { CustomForm } from "../common/custom-form";
import { userEditSchema } from "@/lib/zod";

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    bachataLevel?: string;
    location?: string;
    website?: string;
}

interface ProfileEditProps {
    session: Session;
    profile: UserProfile;
}

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

export function ProfileEdit({ session, profile }: ProfileEditProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <CustomForm

                    className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-end"
                    formSchema={userEditSchema}
                    endpoint={`/users-v2/${profile._id}`}
                    endpointType="PATCH"
                    entityName="user"
                    displayNames={{
                        name: "Name",
                        email: "Email",
                        bio: "Bio",
                        location: "Location",
                        website: "Website",
                        bachataLevel: "Bachata Level",
                    }}
                    selectorList={["bachataLevel"]}
                    optionsMap={editProfileOptionsMap}
                    defaultValues={
                        {
                            name: profile?.name || "",
                            email: profile?.email || "",
                            bio: profile?.bio || "",
                            location: profile?.location || "",
                            website: profile?.website || "",
                            bachataLevel: profile?.bachataLevel || "",
                        }
                    }
                    extraData={{
                        id: profile._id.toString(),
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
    );
}

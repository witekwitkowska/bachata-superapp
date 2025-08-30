"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    preferences?: {
        theme: "light" | "dark" | "auto";
        language: string;
        notifications: boolean;
    };
    bachataLevel?: {
        level: "beginner" | "intermediate" | "advanced" | "expert";
        yearsExperience: number;
        specialties: string[];
    };
    isTeacher?: boolean;
    teacherInfo?: {
        certifications: string[];
        teachingExperience: number;
        specialties: string[];
        availability: string[];
    };
}

export function UserEditForm() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load user profile
    useEffect(() => {
        if (session?.user?.id) {
            loadProfile();
        }
    }, [session]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users/edit/${session?.user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setProfile(data.data);
            } else {
                toast.error("Failed to load profile");
            }
        } catch (error) {
            toast.error("Error loading profile");
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            const response = await fetch(`/api/users/edit/${profile.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                toast.success("Profile updated successfully!");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("Error updating profile");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        if (!profile) return;

        setProfile(prev => {
            if (!prev) return prev;

            const newProfile = { ...prev };
            const fieldParts = field.split('.');

            if (fieldParts.length === 1) {
                (newProfile as any)[field] = value;
            } else if (fieldParts.length === 2) {
                if (!(newProfile as any)[fieldParts[0]]) {
                    (newProfile as any)[fieldParts[0]] = {};
                }
                (newProfile as any)[fieldParts[0]][fieldParts[1]] = value;
            }

            return newProfile;
        });
    };

    if (status === "loading" || loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    if (!session?.user) {
        return <div className="p-8 text-center">Please sign in to edit your profile</div>;
    }

    if (!profile) {
        return <div className="p-8 text-center">Profile not found</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <p className="text-gray-600">Update your personal information and preferences</p>
            </div>

            <div className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={profile.name || ""}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Your name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={profile.email || ""}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="your@email.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) => updateField("bio", e.target.value)}
                        placeholder="Tell us about yourself"
                    />
                </div>

                {/* Preferences */}
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                        value={profile.preferences?.theme || "auto"}
                        onValueChange={(value) => updateField("preferences.theme", value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="notifications"
                        checked={profile.preferences?.notifications || false}
                        onCheckedChange={(checked) => updateField("preferences.notifications", checked)}
                    />
                    <Label htmlFor="notifications">Email notifications</Label>
                </div>

                {/* Bachata Level */}
                <div className="space-y-2">
                    <Label>Bachata Level</Label>
                    <Select
                        value={profile.bachataLevel?.level || "beginner"}
                        onValueChange={(value) => updateField("bachataLevel.level", value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                        id="experience"
                        type="number"
                        min="0"
                        max="50"
                        value={profile.bachataLevel?.yearsExperience || 0}
                        onChange={(e) => updateField("bachataLevel.yearsExperience", parseInt(e.target.value))}
                    />
                </div>

                {/* Teacher Status */}
                <div className="flex items-center space-x-2">
                    <Switch
                        id="isTeacher"
                        checked={profile.isTeacher || false}
                        onCheckedChange={(checked) => updateField("isTeacher", checked)}
                    />
                    <Label htmlFor="isTeacher">I am a teacher</Label>
                </div>

                {profile.isTeacher && (
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Teacher Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="teachingExperience">Teaching Experience (years)</Label>
                            <Input
                                id="teachingExperience"
                                type="number"
                                min="0"
                                value={profile.teacherInfo?.teachingExperience || 0}
                                onChange={(e) => updateField("teacherInfo.teachingExperience", parseInt(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                            <Input
                                id="certifications"
                                value={profile.teacherInfo?.certifications?.join(", ") || ""}
                                onChange={(e) => updateField("teacherInfo.certifications", e.target.value.split(", ").filter(Boolean))}
                                placeholder="Bachata Level 1, Salsa Level 2"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={loadProfile}>
                    Reset
                </Button>
                <Button onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}

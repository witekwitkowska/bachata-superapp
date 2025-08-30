"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Phone, Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadWithPreview } from "@/components/image-upload-with-preview";

interface ProfileData {
    name: string;
    email: string;
    location: string;
    phone: string;
    birthDate: string;
    bio: string;
    profileImage: string;
}

export function ProfileEdit() {
    const [profileData, setProfileData] = useState<ProfileData>({
        name: "John Doe",
        email: "john@example.com",
        location: "New York, NY",
        phone: "+1 (555) 123-4567",
        birthDate: "1990-01-01",
        bio: "Passionate bachata dancer and instructor with over 10 years of experience.",
        profileImage: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (field: keyof ProfileData, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleImagesChange = (images: string[]) => {
        if (images.length > 0) {
            handleInputChange("profileImage", images[0]);
        }
    };

    const handleProfilePhotoChange = (imageUrl: string | null) => {
        handleInputChange("profileImage", imageUrl || "");
    };

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-bold">
                    Edit Profile
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Update your personal information and profile picture
                </p>
            </motion.div>

            <Card className="border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        Profile Information
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Update your personal information and profile picture
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Profile Picture</Label>
                        <ImageUploadWithPreview
                            existingImages={profileData.profileImage ? [profileData.profileImage] : []}
                            onImagesChange={handleImagesChange}
                            maxImages={1}
                            multiple={false}
                            allowProfilePhotoSelection={true}
                            onProfilePhotoChange={handleProfilePhotoChange}
                            currentProfilePhoto={profileData.profileImage}
                            className="max-w-md"
                        />
                    </div>

                    {/* Personal Information Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                disabled={!isEditing}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                disabled={!isEditing}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={profileData.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                                disabled={!isEditing}
                                placeholder="City, State/Country"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                value={profileData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                disabled={!isEditing}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthDate" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Birth Date
                            </Label>
                            <Input
                                id="birthDate"
                                type="date"
                                value={profileData.birthDate}
                                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => handleInputChange("bio", e.target.value)}
                            disabled={!isEditing}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Tell us about yourself and your bachata journey..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6">
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="text-white font-medium px-8 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                    className="px-8 py-2.5 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="text-white font-medium px-8 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

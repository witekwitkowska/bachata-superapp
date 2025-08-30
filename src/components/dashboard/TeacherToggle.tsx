"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, MapPin, Star, Save, BookOpen, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface TeacherData {
    isTeacher: boolean;
    teachingSince: string;
    specializations: string[];
    certifications: string[];
    experience: string;
    locations: string[];
    rates: {
        private: string;
        group: string;
        workshop: string;
    };
    availability: {
        weekdays: boolean;
        weekends: boolean;
        evenings: boolean;
        mornings: boolean;
    };
    bio: string;
    contactInfo: {
        phone: string;
        email: string;
        website: string;
    };
}

const specializations = [
    "Dominican Bachata",
    "Sensual Bachata",
    "Traditional Bachata",
    "Urban Bachata",
    "Bachata Moderna",
    "Bachata Fusion",
    "Social Dancing",
    "Performance",
    "Competition",
    "Choreography"
];

const certificationOptions = [
    "Bachata Instructor Certification",
    "Dance Teacher Diploma",
    "Competition Judge Certification",
    "Choreography Certificate",
    "Music Theory for Dancers",
    "First Aid Certification",
    "Child Safety Certification"
];

const experienceLevels = [
    "1-2 years",
    "3-5 years",
    "6-10 years",
    "10+ years"
];

export function TeacherToggle() {
    const [teacherData, setTeacherData] = useState<TeacherData>({
        isTeacher: false,
        teachingSince: "2020-01-01",
        specializations: ["Dominican Bachata", "Sensual Bachata"],
        certifications: ["Bachata Instructor Certification"],
        experience: "3-5 years",
        locations: ["New York, NY", "Online"],
        rates: {
            private: "$80/hour",
            group: "$25/person/class",
            workshop: "$150/day"
        },
        availability: {
            weekdays: true,
            weekends: false,
            evenings: true,
            mornings: false
        },
        bio: "Experienced bachata instructor with a passion for teaching both beginners and advanced dancers. Specializing in Dominican and Sensual styles with focus on technique, musicality, and social dancing skills.",
        contactInfo: {
            phone: "+1 (555) 123-4567",
            email: "instructor@example.com",
            website: "www.bachatainstructor.com"
        }
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (field: keyof TeacherData, value: any) => {
        setTeacherData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parentField: keyof TeacherData, childField: string, value: any) => {
        setTeacherData(prev => ({
            ...prev,
            [parentField]: {
                ...(prev[parentField] as any),
                [childField]: value
            }
        }));
    };

    const handleArrayChange = (field: keyof TeacherData, value: string, action: 'add' | 'remove') => {
        setTeacherData(prev => {
            const currentArray = prev[field] as string[];
            if (action === 'add') {
                return { ...prev, [field]: [...currentArray, value] };
            } else {
                return { ...prev, [field]: currentArray.filter(item => item !== value) };
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-bold">
                    Teacher Status
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Manage your teacher profile and connect with students
                </p>
            </motion.div>

            {/* Teacher Status Toggle */}
            <Card className="border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        Teacher Status
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Toggle your teacher status and manage your instructor profile
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                        <div className="space-y-1">
                            <Label className="text-base font-medium">Are you a Bachata Teacher?</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {teacherData.isTeacher
                                    ? "You are currently listed as a teacher"
                                    : "You are not currently listed as a teacher"
                                }
                            </p>
                        </div>
                        <Switch
                            checked={teacherData.isTeacher}
                            onCheckedChange={(checked) => handleInputChange("isTeacher", checked)}
                            disabled={isEditing}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Teacher Profile Form */}
            {teacherData.isTeacher && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Teacher Profile
                            </CardTitle>
                            <CardDescription>
                                Complete your teacher profile to attract students
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="teachingSince">Teaching Since</Label>
                                    <Input
                                        id="teachingSince"
                                        type="date"
                                        value={teacherData.teachingSince}
                                        onChange={(e) => handleInputChange("teachingSince", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experience Level</Label>
                                    <select
                                        id="experience"
                                        value={teacherData.experience}
                                        onChange={(e) => handleInputChange("experience", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        {experienceLevels.map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Specializations */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Specializations</Label>
                                <div className="flex flex-wrap gap-2">
                                    {specializations.map((spec) => (
                                        <Button
                                            key={spec}
                                            variant={teacherData.specializations.includes(spec) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                if (isEditing) {
                                                    const action = teacherData.specializations.includes(spec) ? 'remove' : 'add';
                                                    handleArrayChange('specializations', spec, action);
                                                }
                                            }}
                                            disabled={!isEditing}
                                            className={teacherData.specializations.includes(spec) ? "bg-blue-600 hover:bg-blue-700" : ""}
                                        >
                                            {spec}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Certifications</Label>
                                <div className="flex flex-wrap gap-2">
                                    {certificationOptions.map((cert) => (
                                        <Button
                                            key={cert}
                                            variant={teacherData.certifications.includes(cert) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                if (isEditing) {
                                                    const action = teacherData.certifications.includes(cert) ? 'remove' : 'add';
                                                    handleArrayChange('certifications', cert, action);
                                                }
                                            }}
                                            disabled={!isEditing}
                                            className={teacherData.certifications.includes(cert) ? "bg-green-600 hover:bg-green-700" : ""}
                                        >
                                            <Award className="w-4 h-4 mr-1" />
                                            {cert}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Teaching Locations */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Teaching Locations</Label>
                                <div className="flex flex-wrap gap-2">
                                    {teacherData.locations.map((location, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm text-blue-800 dark:text-blue-200">{location}</span>
                                            {isEditing && (
                                                <button
                                                    onClick={() => {
                                                        const newLocations = teacherData.locations.filter((_, i) => i !== index);
                                                        handleInputChange("locations", newLocations);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newLocation = prompt("Enter new location:");
                                                if (newLocation && !teacherData.locations.includes(newLocation)) {
                                                    handleInputChange("locations", [...teacherData.locations, newLocation]);
                                                }
                                            }}
                                        >
                                            <MapPin className="w-4 h-4 mr-1" />
                                            Add Location
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Rates */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Teaching Rates</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="privateRate">Private Lessons</Label>
                                        <Input
                                            id="privateRate"
                                            value={teacherData.rates.private}
                                            onChange={(e) => handleNestedChange("rates", "private", e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="$80/hour"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="groupRate">Group Classes</Label>
                                        <Input
                                            id="groupRate"
                                            value={teacherData.rates.group}
                                            onChange={(e) => handleNestedChange("rates", "group", e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="$25/person/class"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="workshopRate">Workshops</Label>
                                        <Input
                                            id="workshopRate"
                                            value={teacherData.rates.workshop}
                                            onChange={(e) => handleNestedChange("rates", "workshop", e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="$150/day"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Availability</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(teacherData.availability).map(([key, value]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <Switch
                                                checked={value}
                                                onCheckedChange={(checked) => handleNestedChange("availability", key, checked)}
                                                disabled={!isEditing}
                                            />
                                            <Label className="text-sm capitalize">{key}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <Label htmlFor="bio">Teaching Bio</Label>
                                <textarea
                                    id="bio"
                                    value={teacherData.bio}
                                    onChange={(e) => handleInputChange("bio", e.target.value)}
                                    disabled={!isEditing}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Tell potential students about your teaching style and experience..."
                                />
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Contact Information</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Phone</Label>
                                        <Input
                                            id="contactPhone"
                                            value={teacherData.contactInfo.phone}
                                            onChange={(e) => handleNestedChange("contactInfo", "phone", e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactEmail">Email</Label>
                                        <Input
                                            id="contactEmail"
                                            type="email"
                                            value={teacherData.contactInfo.email}
                                            onChange={(e) => handleNestedChange("contactInfo", "email", e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="instructor@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactWebsite">Website</Label>
                                        <Input
                                            id="contactWebsite"
                                            value={teacherData.contactInfo.website}
                                            onChange={(e) => handleNestedChange("contactInfo", "website", e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="www.yourwebsite.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Teacher Benefits */}
            {teacherData.isTeacher && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5" />
                            Teacher Benefits
                        </CardTitle>
                        <CardDescription>
                            What you get as a verified bachata teacher
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Student Discovery</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Get discovered by students looking for bachata instructors
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Teaching Resources</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Access to lesson plans, music, and teaching materials
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                        <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Verification Badge</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Verified teacher badge to build trust with students
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Class Management</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Tools to manage classes, schedules, and student progress
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

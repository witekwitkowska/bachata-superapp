"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Star, BookOpen, Award, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ConfigurableForm, ConfigurableFormRef } from "@/components/common/configurable-form";
import { teacherSchema } from "@/lib/zod";
import { useSession } from "next-auth/react";
import { handleFetch, handlePatch } from "@/lib/fetch";
import { toast } from "@/components/ui/toast";

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
    { value: "1-2 years", label: "1-2 years" },
    { value: "3-5 years", label: "3-5 years" },
    { value: "6-10 years", label: "6-10 years" },
    { value: "10+ years", label: "10+ years" }
];

// Transform nested teacher data to flattened format for form
function flattenTeacherData(profile: any) {
    return {
        isTeacher: profile?.isTeacher || false,
        teachingSince: profile?.teachingSince || "",
        specializations: profile?.specializations || [],
        certifications: profile?.certifications || [],
        experience: profile?.experience || "",
        locations: profile?.locations || [],
        ratePrivate: profile?.rates?.private || "",
        rateGroup: profile?.rates?.group || "",
        rateWorkshop: profile?.rates?.workshop || "",
        availabilityWeekdays: profile?.availability?.weekdays || false,
        availabilityWeekends: profile?.availability?.weekends || false,
        availabilityEvenings: profile?.availability?.evenings || false,
        availabilityMornings: profile?.availability?.mornings || false,
        teachingBio: profile?.teachingBio || profile?.bio || "",
        contactPhone: profile?.contactInfo?.phone || "",
        contactEmail: profile?.contactInfo?.email || "",
        contactWebsite: profile?.contactInfo?.website || "",
    };
}

// Transform flattened form data back to nested format for API
function nestTeacherData(data: any) {
    return {
        isTeacher: data.isTeacher,
        teachingSince: data.teachingSince,
        specializations: data.specializations,
        certifications: data.certifications,
        experience: data.experience,
        locations: data.locations,
        rates: {
            private: data.ratePrivate,
            group: data.rateGroup,
            workshop: data.rateWorkshop,
        },
        availability: {
            weekdays: data.availabilityWeekdays,
            weekends: data.availabilityWeekends,
            evenings: data.availabilityEvenings,
            mornings: data.availabilityMornings,
        },
        teachingBio: data.teachingBio,
        contactInfo: {
            phone: data.contactPhone,
            email: data.contactEmail,
            website: data.contactWebsite,
        },
    };
}

export function TeacherToggle() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isTeacher, setIsTeacher] = useState(false);
    const formRef = useRef<ConfigurableFormRef<typeof teacherSchema>>(null);

    useEffect(() => {
        if (session?.user?.id) {
            loadProfile();
        }
    }, [session]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const { data, success } = await handleFetch(`/api/users/${session?.user?.id}`);
            if (success && data) {
                setProfile(data);
                setIsTeacher(data.isTeacher || false);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherToggle = async (checked: boolean) => {
        setIsTeacher(checked);
        if (checked && formRef.current) {
            // Enable editing when teacher status is turned on
            formRef.current.setValue("isTeacher", true);
        }
    };


    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const defaultValues = flattenTeacherData(profile);

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
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        Teacher Status
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Toggle your teacher status and manage your instructor profile
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-primary rounded-lg">
                        <div className="space-y-1">
                            <Label className="text-base font-medium">Are you a Bachata Teacher?</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isTeacher
                                    ? "You are currently listed as a teacher"
                                    : "You are not currently listed as a teacher"
                                }
                            </p>
                        </div>
                        <Switch
                            checked={isTeacher}
                            onCheckedChange={handleTeacherToggle}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Teacher Profile Form */}
            {isTeacher && (
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
                        <CardContent>
                            <ConfigurableForm
                                ref={formRef}
                                formSchema={teacherSchema}
                                endpoint={`/api/users/${session?.user?.id}`}
                                endpointType="PATCH"
                                entityName="teacher"
                                displayNames={{
                                    isTeacher: "Teacher Status",
                                    teachingSince: "Teaching Since",
                                    specializations: "Specializations",
                                    certifications: "Certifications",
                                    experience: "Experience Level",
                                    locations: "Teaching Locations",
                                    ratePrivate: "Private Lessons Rate",
                                    rateGroup: "Group Classes Rate",
                                    rateWorkshop: "Workshops Rate",
                                    availabilityWeekdays: "Available Weekdays",
                                    availabilityWeekends: "Available Weekends",
                                    availabilityEvenings: "Available Evenings",
                                    availabilityMornings: "Available Mornings",
                                    teachingBio: "Teaching Bio",
                                    contactPhone: "Phone",
                                    contactEmail: "Email",
                                    contactWebsite: "Website",
                                }}
                                defaultValues={defaultValues}
                                selectorList={["experience"]}
                                multiSelectorList={["specializations", "certifications", "locations"]}
                                switchList={[
                                    "isTeacher",
                                    "availabilityWeekdays",
                                    "availabilityWeekends",
                                    "availabilityEvenings",
                                    "availabilityMornings",
                                ]}
                                optionsMap={{
                                    experience: experienceLevels,
                                    specializations: specializations.map(s => ({ value: s, label: s })),
                                    certifications: certificationOptions.map(c => ({ value: c, label: c })),
                                }}
                                dateOnlyList={["teachingSince"]}
                                textareaList={["teachingBio"]}
                                exclusionList={["isTeacher"]} // Exclude isTeacher from form since it's in the toggle above
                                buttonTitle="Save Changes"
                                isSubmitDisabled={true} // Disable default submission to handle transformation
                                extraData={{
                                    id: session?.user?.id,
                                }}
                                className="space-y-6"
                            />
                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const formValues = formRef.current?.getValues() || {};
                                        // Transform flattened data to nested format
                                        const nestedData = nestTeacherData({
                                            ...formValues,
                                            isTeacher: isTeacher,
                                        });

                                        try {
                                            const { success, error } = await handlePatch(
                                                `/api/users/${session?.user?.id}`,
                                                nestedData,
                                                "Failed to update teacher profile"
                                            );
                                            if (success) {
                                                toast.success("Teacher profile updated successfully");
                                                await loadProfile();
                                            }
                                        } catch (err) {
                                            console.error("Error saving teacher profile:", err);
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Teacher Benefits */}
            {isTeacher && (
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

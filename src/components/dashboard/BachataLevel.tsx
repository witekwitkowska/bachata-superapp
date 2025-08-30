"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Award, Clock, Users, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface BachataLevelData {
    currentLevel: string;
    yearsExperience: number;
    danceStyles: string[];
    certifications: string[];
    teachingExperience: number;
    performanceExperience: number;
    goals: string[];
    notes: string;
}

const bachataLevels = [
    {
        id: "beginner",
        name: "Beginner",
        description: "Just starting with bachata",
        skills: ["Basic steps", "Simple turns", "Basic rhythm"],
        color: "from-green-500 to-emerald-600",
        icon: "🌱"
    },
    {
        id: "intermediate",
        name: "Intermediate",
        description: "Comfortable with fundamentals",
        skills: ["Complex turns", "Body movement", "Musicality"],
        color: "from-blue-500 to-cyan-600",
        icon: "🌿"
    },
    {
        id: "advanced",
        name: "Advanced",
        description: "Mastered complex patterns",
        skills: ["Advanced combinations", "Improvisation", "Performance"],
        color: "from-purple-500 to-pink-600",
        icon: "🌸"
    },
    {
        id: "expert",
        name: "Expert",
        description: "Professional level",
        skills: ["Choreography", "Teaching", "Competition"],
        color: "from-orange-500 to-red-600",
        icon: "🏆"
    }
];

const danceStyles = [
    "Dominican Bachata",
    "Sensual Bachata",
    "Traditional Bachata",
    "Urban Bachata",
    "Bachata Moderna"
];

const certificationOptions = [
    "Bachata Instructor Certification",
    "Dance Teacher Diploma",
    "Competition Judge Certification",
    "Choreography Certificate",
    "Music Theory for Dancers"
];

const goalOptions = [
    "Improve technique",
    "Learn new moves",
    "Compete professionally",
    "Start teaching",
    "Perform in shows",
    "Travel for workshops"
];

export function BachataLevel() {
    const [levelData, setLevelData] = useState<BachataLevelData>({
        currentLevel: "intermediate",
        yearsExperience: 3,
        danceStyles: ["Dominican Bachata", "Sensual Bachata"],
        certifications: ["Bachata Instructor Certification"],
        teachingExperience: 1,
        performanceExperience: 2,
        goals: ["Improve technique", "Learn new moves"],
        notes: "Focusing on improving musicality and connection with partner."
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (field: keyof BachataLevelData, value: any) => {
        setLevelData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: keyof BachataLevelData, value: string, action: 'add' | 'remove') => {
        setLevelData(prev => {
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

    const currentLevelInfo = bachataLevels.find(level => level.id === levelData.currentLevel);

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
                    Bachata Level
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Track your progress and set your experience level
                </p>
            </motion.div>

            {/* Current Level Overview */}
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        Current Bachata Level
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Your current experience and skill level in bachata
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Level Display */}
                        <div className="space-y-4">
                            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentLevelInfo?.color} flex items-center justify-center text-4xl`}>
                                {currentLevelInfo?.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {currentLevelInfo?.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {currentLevelInfo?.description}
                                </p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Current Skills</h4>
                            <div className="space-y-2">
                                {currentLevelInfo?.skills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Experience Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Experience & Skills
                    </CardTitle>
                    <CardDescription>
                        Detailed information about your bachata journey
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-800 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {levelData.yearsExperience}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-800 rounded-lg">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {levelData.teachingExperience}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Years Teaching</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-800 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {levelData.performanceExperience}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Years Performing</div>
                        </div>
                    </div>

                    {/* Dance Styles */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Dance Styles</Label>
                        <div className="flex flex-wrap gap-2">
                            {danceStyles.map((style) => (
                                <Button
                                    key={style}
                                    variant={levelData.danceStyles.includes(style) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        if (isEditing) {
                                            const action = levelData.danceStyles.includes(style) ? 'remove' : 'add';
                                            handleArrayChange('danceStyles', style, action);
                                        }
                                    }}
                                    disabled={!isEditing}
                                    className={levelData.danceStyles.includes(style) ? "bg-blue-600 hover:bg-blue-700" : ""}
                                >
                                    {style}
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
                                    variant={levelData.certifications.includes(cert) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        if (isEditing) {
                                            const action = levelData.certifications.includes(cert) ? 'remove' : 'add';
                                            handleArrayChange('certifications', cert, action);
                                        }
                                    }}
                                    disabled={!isEditing}
                                    className={levelData.certifications.includes(cert) ? "bg-green-600 hover:bg-green-700" : ""}
                                >
                                    <Award className="w-4 h-4 mr-1" />
                                    {cert}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Goals */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Dance Goals</Label>
                        <div className="flex flex-wrap gap-2">
                            {goalOptions.map((goal) => (
                                <Button
                                    key={goal}
                                    variant={levelData.goals.includes(goal) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        if (isEditing) {
                                            const action = levelData.goals.includes(goal) ? 'remove' : 'add';
                                            handleArrayChange('goals', goal, action);
                                        }
                                    }}
                                    disabled={!isEditing}
                                    className={levelData.goals.includes(goal) ? "bg-purple-600 hover:bg-purple-700" : ""}
                                >
                                    {goal}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <textarea
                            id="notes"
                            value={levelData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Add any additional notes about your bachata journey..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Edit Information
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

            {/* Level Progression */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Level Progression
                    </CardTitle>
                    <CardDescription>
                        Track your progress through different bachata levels
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {bachataLevels.map((level, index) => (
                            <div
                                key={level.id}
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${level.id === levelData.currentLevel
                                    ? `border-blue-500 bg-blue-50 dark:bg-blue-900/20`
                                    : "border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl`}>
                                    {level.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{level.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
                                </div>
                                {level.id === levelData.currentLevel && (
                                    <div className="text-blue-600 dark:text-blue-400">
                                        <Star className="w-6 h-6 fill-current" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

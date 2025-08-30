"use client";

import { motion } from "framer-motion";
import { Settings, User, Shield, Bell, Palette, Globe, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
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
                    Account Settings
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Manage your account preferences, privacy settings, and notifications
                </p>
            </motion.div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Account Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                Account Settings
                            </CardTitle>
                            <CardDescription>
                                Manage your personal information and account preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Email Notifications</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Receive updates about your account
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Profile Visibility</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Make your profile public to other dancers
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Auto-login</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Stay signed in on this device
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Privacy & Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                Privacy & Security
                            </CardTitle>
                            <CardDescription>
                                Control your privacy settings and security preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Add an extra layer of security
                                    </p>
                                </div>
                                <Switch />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Location Sharing</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Allow other dancers to see your location
                                    </p>
                                </div>
                                <Switch />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Activity Status</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Show when you're online
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-white" />
                                </div>
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                Choose what notifications you want to receive
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">New Messages</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        When someone sends you a message
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Event Updates</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Changes to events you're attending
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Community Posts</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        New posts from your dance community
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Appearance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                    <Palette className="w-4 h-4 text-white" />
                                </div>
                                Appearance
                            </CardTitle>
                            <CardDescription>
                                Customize how the app looks and feels
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Dark Mode</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Use dark theme for better visibility
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Compact Layout</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Use more compact spacing
                                    </p>
                                </div>
                                <Switch />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Animations</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Enable smooth animations
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Advanced Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                                <Settings className="w-5 h-5 text-white" />
                            </div>
                            Advanced Settings
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Advanced configuration options for power users
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                                <Globe className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Language</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">English (US)</p>
                                <Button variant="outline" size="sm">Change</Button>
                            </div>

                            <div className="text-center p-4 rounded-xl border border-green-200/50 dark:border-green-700/50">
                                <Database className="w-8 h-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Export</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Download your data</p>
                                <Button variant="outline" size="sm">Export</Button>
                            </div>

                            <div className="text-center p-4 rounded-xl border border-red-200/50 dark:border-red-700/50">
                                <Key className="w-8 h-8 mx-auto mb-3 text-red-600 dark:text-red-400" />
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">API Keys</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Manage integrations</p>
                                <Button variant="outline" size="sm">Manage</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex justify-center space-x-4"
            >
                <Button variant="outline" size="lg" className="px-8">
                    Reset to Defaults
                </Button>
                <Button size="lg" className="px-8">
                    Save Changes
                </Button>
            </motion.div>
        </div>
    );
}

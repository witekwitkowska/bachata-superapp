"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, Tag as TagIcon } from "lucide-react";
import { ConfigurableForm } from "@/components/common/configurable-form";
import { tagSchema } from "@/lib/zod";
import type { Tag, TagInput, TagCategory } from "@/types/tag.types";
import { toast } from "sonner";

export function TagsAdmin() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<TagCategory | "all">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const fetchTags = async () => {
        try {
            const response = await fetch("/api/website-elements/tags");
            const result = await response.json();

            if (result.success) {
                setTags(result.data);
            } else {
                toast.error("Failed to load tags");
            }
        } catch (error) {
            toast.error("An error occurred while loading tags");
            console.error("Error fetching tags:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        try {
            const response = await fetch(`/api/website-elements/tags/${tagId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Tag deleted successfully!");
                fetchTags();
            } else {
                toast.error(result.error || "Failed to delete tag");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the tag");
            console.error("Error deleting tag:", error);
        }
    };

    const handleToggleStatus = async (tag: Tag) => {
        try {
            const response = await fetch(`/api/website-elements/tags/${tag.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isActive: !tag.isActive,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Tag ${tag.isActive ? "deactivated" : "activated"} successfully!`);
                fetchTags();
            } else {
                toast.error(result.error || "Failed to update tag");
            }
        } catch (error) {
            toast.error("An error occurred while updating the tag");
            console.error("Error updating tag:", error);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    // Filter tags based on search and filters
    const filteredTags = tags.filter(tag => {
        const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tag.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || tag.category === categoryFilter;
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && tag.isActive) ||
            (statusFilter === "inactive" && !tag.isActive);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getCategoryColor = (category: TagCategory) => {
        const colors = {
            general: "bg-gray-100 text-gray-800",
            event: "bg-blue-100 text-blue-800",
            location: "bg-green-100 text-green-800",
            skill: "bg-purple-100 text-purple-800",
            style: "bg-pink-100 text-pink-800",
        };
        return colors[category];
    };

    const defaultValues: TagInput = {
        name: "",
        description: "",
        color: "#3B82F6",
        category: "general",
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const displayNames: Record<string, string> = {
        name: "Tag Name",
        description: "Description",
        color: "Color",
        category: "Category",
        isActive: "Active",
    };

    const categoryOptions = [
        { value: "general", label: "General" },
        { value: "event", label: "Event" },
        { value: "location", label: "Location" },
        { value: "skill", label: "Skill" },
        { value: "style", label: "Style" },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Tags Management</h2>
                </div>

                <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-8 w-8 rounded" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tags Management</h2>
                    <p className="text-muted-foreground">Manage website tags and categories</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Tag
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Tag</DialogTitle>
                        </DialogHeader>
                        <ConfigurableForm
                            formSchema={tagSchema}
                            endpoint="/api/website-elements/tags"
                            entityName="tag"
                            displayNames={displayNames}
                            defaultValues={defaultValues}
                            buttonTitle="Create Tag"
                            loadingTitle="Creating Tag..."
                            onFormSuccess={() => {
                                setIsCreateDialogOpen(false);
                                fetchTags();
                            }}
                            optionsMap={{
                                category: categoryOptions,
                            }}
                            switchList={["isActive"]}
                            exclusionList={["usageCount", "createdAt", "updatedAt"]}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TagCategory | "all")}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categoryOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tags List */}
            <div className="grid gap-4">
                {filteredTags.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <TagIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold mb-2">No tags found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                                    ? "No tags match your current filters."
                                    : "Get started by creating your first tag."}
                            </p>
                            {!searchTerm && categoryFilter === "all" && statusFilter === "all" && (
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Tag
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredTags.map((tag) => (
                        <Card key={tag.id}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="h-8 w-8 rounded flex items-center justify-center text-white font-semibold"
                                            style={{ backgroundColor: tag.color }}
                                        >
                                            {tag.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold">{tag.name}</h3>
                                                <Badge className={getCategoryColor(tag.category)}>
                                                    {tag.category}
                                                </Badge>
                                                {!tag.isActive && (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </div>
                                            {tag.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {tag.description}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                <span>Used {tag.usageCount} times</span>
                                                <span>Created {new Date(tag.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={tag.isActive}
                                            onCheckedChange={() => handleToggleStatus(tag)}
                                        />
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Tag</DialogTitle>
                                                </DialogHeader>
                                                <ConfigurableForm
                                                    formSchema={tagSchema}
                                                    endpoint={`/api/website-elements/tags/${tag.id}`}
                                                    entityName="tag"
                                                    displayNames={displayNames}
                                                    defaultValues={{
                                                        name: tag.name,
                                                        description: tag.description || "",
                                                        color: tag.color,
                                                        category: tag.category,
                                                        isActive: tag.isActive,
                                                        usageCount: tag.usageCount,
                                                        createdAt: tag.createdAt,
                                                        updatedAt: tag.updatedAt,
                                                    }}
                                                    buttonTitle="Update Tag"
                                                    loadingTitle="Updating Tag..."
                                                    endpointType="PATCH"
                                                    onFormSuccess={() => {
                                                        fetchTags();
                                                    }}
                                                    optionsMap={{
                                                        category: categoryOptions,
                                                    }}
                                                    switchList={["isActive"]}
                                                    exclusionList={["usageCount", "createdAt", "updatedAt"]}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete the tag "{tag.name}"? This action cannot be undone.
                                                        {tag.usageCount > 0 && (
                                                            <span className="block mt-2 text-orange-600">
                                                                Warning: This tag is currently used {tag.usageCount} times.
                                                            </span>
                                                        )}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteTag(tag.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Stats */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{tags.length}</div>
                            <div className="text-sm text-muted-foreground">Total Tags</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{tags.filter(t => t.isActive).length}</div>
                            <div className="text-sm text-muted-foreground">Active Tags</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{tags.reduce((sum, t) => sum + t.usageCount, 0)}</div>
                            <div className="text-sm text-muted-foreground">Total Usage</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {tags.filter(t => t.category === "general").length}
                            </div>
                            <div className="text-sm text-muted-foreground">General Tags</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

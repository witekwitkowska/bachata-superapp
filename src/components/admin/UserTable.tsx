"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/types/user.d";
import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handlePatch } from "@/lib/fetch";

interface UserTableProps {
    users: UserProfile[];
    onUserUpdate?: () => void;
}

const roleOptions = [
    { value: "visitor", label: "Visitor", color: "bg-gray-100 text-gray-800" },
    { value: "organizer", label: "Organizer", color: "bg-blue-100 text-blue-800" },
    { value: "admin", label: "Admin", color: "bg-red-100 text-red-800" },
];

const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800" },
    { value: "suspended", label: "Suspended", color: "bg-red-100 text-red-800" },
];

export function UserTable({ users, onUserUpdate }: UserTableProps) {
    const { toast } = useToast();
    const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingUsers(prev => new Set(prev).add(userId));

        try {
            await handlePatch(
                `/api/users/${userId}`,
                { role: newRole },
                "Failed to update user role"
            );

            toast({
                title: "Success",
                description: "User role updated successfully",
            });

            onUserUpdate?.();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update user role",
                variant: "destructive",
            });
        } finally {
            setUpdatingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        setUpdatingUsers(prev => new Set(prev).add(userId));

        try {
            await handlePatch(
                `/api/users/${userId}`,
                { status: newStatus },
                "Failed to update user status"
            );

            toast({
                title: "Success",
                description: "User status updated successfully",
            });

            onUserUpdate?.();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update user status",
                variant: "destructive",
            });
        } finally {
            setUpdatingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    const columns: ColumnDef<UserProfile>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                            <div className="font-medium">{user.name || "No name"}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string;
                const roleOption = roleOptions.find(r => r.value === role) || roleOptions[0];

                return (
                    <Select
                        value={role || "visitor"}
                        onValueChange={(newRole) => handleRoleChange(row.original.id, newRole)}
                        disabled={updatingUsers.has(row.original.id)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {roleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center space-x-2">
                                        <Badge className={option.color}>
                                            {option.label}
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = (row.getValue("status") as string) || "active";
                const statusOption = statusOptions.find(s => s.value === status) || statusOptions[0];

                return (
                    <Select
                        value={status}
                        onValueChange={(newStatus) => handleStatusChange(row.original.id, newStatus)}
                        disabled={updatingUsers.has(row.original.id)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center space-x-2">
                                        <Badge className={option.color}>
                                            {option.label}
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            accessorKey: "isTeacher",
            header: "Teacher",
            cell: ({ row }) => {
                const isTeacher = row.getValue("isTeacher") as boolean;
                return (
                    <div className="flex items-center">
                        {isTeacher ? (
                            <UserCheck className="w-4 h-4 text-green-600" />
                        ) : (
                            <UserX className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "bachataLevel",
            header: "Bachata Level",
            cell: ({ row }) => {
                const level = row.getValue("bachataLevel") as string;
                return (
                    <Badge variant="outline">
                        {level || "Not set"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }) => {
                const date = row.getValue("createdAt") as string;
                return (
                    <div className="text-sm text-muted-foreground">
                        {date ? new Date(date).toLocaleDateString() : "Unknown"}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const user = row.original;
                const isUpdating = updatingUsers.has(user.id);

                return (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Navigate to user profile or edit modal
                                window.open(`/profile/${user.id}`, '_blank');
                            }}
                            disabled={isUpdating}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Handle delete user
                                if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                                    // Implement delete functionality

                                }
                            }}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={users}
            hasFilters={true}
            hasPagination={true}
            hasSorting={true}
            hasSelectors={true}
            selectors={[
                {
                    name: "role",
                    values: ["all", "visitor", "organizer", "admin", 'teacher'],
                    displayLabels: {
                        all: "All Roles",
                        visitor: "Visitor",
                        organizer: "Organizer",
                        admin: "Admin",
                        teacher: "Teacher"
                    }
                },
                {
                    name: "status",
                    values: ["all", "active", "inactive", "suspended"],
                    displayLabels: {
                        all: "All Status",
                        active: "Active",
                        inactive: "Inactive",
                        suspended: "Suspended"
                    }
                },
                {
                    name: "isTeacher",
                    values: ["all", "true", "false"],
                    displayLabels: {
                        all: "All Teachers",
                        true: "Teachers Only",
                        false: "Non-Teachers"
                    }
                }
            ]}
        />
    );
}

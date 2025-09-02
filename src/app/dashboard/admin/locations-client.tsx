"use client";

import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LocationForm } from "./location-form";
import { useTableRefresh } from "@/hooks/use-table-refresh";
import type { Location } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { handleDelete } from "@/lib/fetch";

interface LocationsClientProps {
    initialLocations: Location[];
}

export function LocationsClient({ initialLocations }: LocationsClientProps) {
    const [locations, setLocations] = useState<Location[]>(initialLocations);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    // Use the table refresh hook
    const { scheduleRefresh } = useTableRefresh<Location>({
        endpoint: "/api/locations",
        onRefresh: setLocations,
        refreshDelay: 100,
    });

    const handleDeletion = async (id: string) => {
        if (!confirm("Are you sure you want to delete this location?")) return;

        try {
            const response = await handleDelete(`/api/locations/${id}`)
            if (response?.success) {
                // Schedule table refresh
                scheduleRefresh();
            }

        } catch (error) {
            console.error("Error deleting location:", error);
        }
    };

    const handleEdit = (location: Location) => {
        setEditingLocation(location);
        setIsDialogOpen(true);
    };

    const handleFormSubmit = async (formData: Record<string, unknown>) => {
        try {
            const url = editingLocation
                ? `/api/locations/${editingLocation.id}`
                : "/api/locations";

            const method = editingLocation ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsDialogOpen(false);
                setEditingLocation(null);
                // Schedule table refresh
                scheduleRefresh();
            }
        } catch (error) {
            console.error("Error saving location:", error);
        }
    };

    const columns: ColumnDef<Location>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "address",
            header: "Address",
        },
        {
            accessorKey: "city",
            header: "City",
        },
        {
            accessorKey: "country",
            header: "Country",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const location = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(location)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletion(location.id)}
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Locations</h1>
                    <p className="text-muted-foreground">Manage event locations</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Location</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingLocation ? "Edit" : "Add New"} Location
                            </DialogTitle>
                        </DialogHeader>
                        <LocationForm
                            initialData={editingLocation}
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setIsDialogOpen(false);
                                setEditingLocation(null);
                            }}
                            onFormSuccess={() => {
                                scheduleRefresh();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Locations</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={locations}
                        hasFilters={true}
                        hasPagination={true}
                        hasSorting={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

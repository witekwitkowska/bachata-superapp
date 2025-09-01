"use client";

import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from "./event-form";
import type { Event } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

interface EventAdminPageProps {
    eventType: string;
    title: string;
    description: string;
    initialEvents: Event[];
}

export function EventAdminPage({ eventType, title, description, initialEvents }: EventAdminPageProps) {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const fetchEvents = async () => {
        try {
            const response = await fetch("/api/events");
            const data = await response.json();
            if (data.success) {
                const filteredEvents = data.data.filter((event: Event) => event.type === eventType);
                setEvents(filteredEvents);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const response = await fetch(`/api/events/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setIsDialogOpen(true);
    };

    const handleFormSubmit = async (formData: Record<string, unknown>) => {
        try {
            const url = editingEvent
                ? `/api/events/${editingEvent.id}`
                : "/api/events";

            const method = editingEvent ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    type: eventType,
                }),
            });

            if (response.ok) {
                setIsDialogOpen(false);
                setEditingEvent(null);
                fetchEvents();
            }
        } catch (error) {
            console.error("Error saving event:", error);
        }
    };

    const columns: ColumnDef<Event>[] = [
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "time",
            header: "Date & Time",
            cell: ({ row }) => {
                const date = new Date(row.getValue("time"));
                return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            },
        },
        {
            accessorKey: "isPaid",
            header: "Payment",
            cell: ({ row }) => {
                const isPaid = row.getValue("isPaid");
                return (
                    <Badge variant={isPaid ? "default" : "secondary"}>
                        {isPaid ? "Paid" : "Free"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "published",
            header: "Status",
            cell: ({ row }) => {
                const published = row.getValue("published");
                return (
                    <Badge variant={published ? "default" : "secondary"}>
                        {published ? "Published" : "Draft"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const event = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(event)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(event.id)}
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="w-full space-y-6">
            <div className="w-full flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New {title.slice(0, -1)}</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingEvent ? "Edit" : "Add New"} {title.slice(0, -1)}
                            </DialogTitle>
                        </DialogHeader>
                        <EventForm
                            eventType={eventType}
                            initialData={editingEvent}
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setIsDialogOpen(false);
                                setEditingEvent(null);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All {title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={events}
                        hasFilters={true}
                        hasPagination={true}
                        hasSorting={true}
                        hasSelectors={true}
                        selectors={[
                            {
                                name: "published",
                                values: ["active", "inactive"],
                                displayLabels: {
                                    active: "Published",
                                    inactive: "Draft",
                                },
                            },
                            {
                                name: "isPaid",
                                values: ["paid", "free"],
                                displayLabels: {
                                    paid: "Paid",
                                    free: "Free",
                                },
                            },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

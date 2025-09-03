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
import { useTableRefresh } from "@/hooks/use-table-refresh";
import { handleDelete, handleFetch } from "@/lib/fetch";

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

    const { scheduleRefresh } = useTableRefresh<Event>({
        endpoint: "/api/events",
        onRefresh: setEvents,
        refreshDelay: 100,
    });

    const fetchEvents = async () => {
        try {
            const { data, success } = await handleFetch("/api/events", "Failed to fetch events");
            if (success) {
                const filteredEvents = data.filter((event: Event) => event.type === eventType);
                setEvents(filteredEvents);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleDeletion = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            await handleDelete(`/api/events/${id}`, "Failed to delete event");
            // fetchEvents();
            scheduleRefresh();
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
                // fetchEvents();
                scheduleRefresh();
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
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => {
                const location = row.getValue("location") as Record<string, string>;
                return location?.name;
            },
        },
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("startDate"));
                return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            },
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("endDate"));
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
                            onClick={() => handleDeletion(event.id)}
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
                    <DialogContent>
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
                            onFormSuccess={() => {
                                scheduleRefresh();
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

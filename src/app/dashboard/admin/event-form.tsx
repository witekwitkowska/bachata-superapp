"use client";

import { useState, useEffect } from "react";
import { ConfigurableForm } from "@/components/common/configurable-form";
import { Button } from "@/components/ui/button";
import {
    baseEventSchema,
    socialEventSchema,
    festivalEventSchema,
    privateSessionSchema,
    workshopSchema,
} from "@/lib/zod";
import { formatFieldName, getSchemaFields } from "@/utils";
import type { Event } from "@/types";
import type { z } from "zod";

interface EventFormProps {
    eventType: string;
    initialData?: Event | null;
    onSubmit: (data: Record<string, unknown>) => void;
    onCancel: () => void;
}

type BaseEventInput = z.infer<typeof baseEventSchema>;
type SocialEventInput = z.infer<typeof socialEventSchema>;
type FestivalEventInput = z.infer<typeof festivalEventSchema>;
type PrivateSessionInput = z.infer<typeof privateSessionSchema>;
type WorkshopInput = z.infer<typeof workshopSchema>;

export function EventForm({ eventType, initialData, onSubmit, onCancel }: EventFormProps) {
    const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
    const [users, setUsers] = useState<Array<{ id: string; name: string; role: string }>>([]);

    useEffect(() => {
        fetchLocations();
        fetchUsers();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await fetch("/api/locations");
            const data = await response.json();
            if (data.success) {
                setLocations(data.data);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users");
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const getSchema = () => {
        switch (eventType) {
            case "social":
                return socialEventSchema;
            case "festival":
                return festivalEventSchema;
            case "private-session":
                return privateSessionSchema;
            case "workshop":
                return workshopSchema;
            default:
                return baseEventSchema;
        }
    };

    const getDisplayNames = () => {
        // Get the schema for the current event type
        const schema = getSchema();

        // Extract display names from schema shape, excluding 'type'
        const schemaFields = getSchemaFields(schema, ['type']);

        // Create display names using the utility function
        const displayNames: Record<string, string> = {};

        for (const field of schemaFields) {
            displayNames[field] = formatFieldName(field);
        }

        return displayNames;
    };

    const getOptionsMap = () => {
        const baseOptionsMap = {
            currency: [
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "GBP", label: "GBP" },
            ],
            locationId: locations.map(location => ({
                value: location.id,
                label: location.name,
            })),
            skillLevel: [
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
            ],
            // Add options for ID fields that will be auto-detected
            teacherId: users.filter(user => user.role === 'teacher' || user.role === 'admin').map(user => ({
                value: user.id,
                label: user.name,
            })),
            studentId: users.filter(user => user.role === 'user' || user.role === 'student').map(user => ({
                value: user.id,
                label: user.name,
            })),
            organizerId: users.filter(user => user.role === 'admin' || user.role === 'organizer').map(user => ({
                value: user.id,
                label: user.name,
            })),
        };

        return baseOptionsMap;
    };

    const getDefaultValues = () => {
        // Get the schema for the current event type
        const schema = getSchema();

        try {
            // Parse with minimal data including the required 'type' field
            const baseDefaults = schema.parse({ type: eventType });

            // Override with initial data if provided
            if (initialData) {
                return {
                    ...baseDefaults,
                    ...initialData,
                };
            }

            return baseDefaults;
        } catch (error) {
            console.error("Error getting schema defaults:", error);
            // Fallback to basic defaults if schema parsing fails
            const fallbackDefaults = {
                title: "",
                description: "",
                time: new Date(),
                isPaid: false,
                locationId: "",
                published: false,
                price: 0,
                currency: "USD",
            };

            if (initialData) {
                return {
                    ...fallbackDefaults,
                    ...initialData,
                };
            }

            return fallbackDefaults;
        }
    };

    return (
        <div className="space-y-6">
            <ConfigurableForm
                formSchema={getSchema()}
                endpoint=""
                entityName="event"
                displayNames={getDisplayNames()}
                defaultValues={getDefaultValues()}
                buttonTitle={initialData ? "Update Event" : "Create Event"}
                headerTitle={`${initialData ? "Edit" : "Add New"} ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`}
                loadingTitle="Saving..."
                selectorList={undefined}
                switchList={undefined}
                exclusionList={["type"]}
                optionsMap={getOptionsMap()}
                dateList={["time", "startDate", "endDate"]}
                className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-end"
            />

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

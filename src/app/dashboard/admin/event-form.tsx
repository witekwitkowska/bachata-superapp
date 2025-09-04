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
import { formatFieldName, getSchemaFields, extractSchemaDefaults } from "@/utils";
import type { Event } from "@/types";
import type { z } from "zod";
import { handleFetch } from "@/lib/fetch";

interface EventFormProps {
    eventType: string;
    initialData?: Event | null;
    onSubmit: (data: Record<string, unknown>) => void;
    onCancel: () => void;
    onFormSuccess?: () => void;
}

type BaseEventInput = z.infer<typeof baseEventSchema>;
type SocialEventInput = z.infer<typeof socialEventSchema>;
type FestivalEventInput = z.infer<typeof festivalEventSchema>;
type PrivateSessionInput = z.infer<typeof privateSessionSchema>;
type WorkshopInput = z.infer<typeof workshopSchema>;

export function EventForm({ eventType, initialData, onSubmit, onCancel, onFormSuccess }: EventFormProps) {
    const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
    const [users, setUsers] = useState<Array<{ id: string; name: string; role: string }>>([]);

    useEffect(() => {
        fetchLocations();
        fetchUsers();
    }, []);

    const fetchLocations = async () => {
        try {
            const { data, success } = await handleFetch("/api/locations", "Failed to fetch locations");
            if (success) {
                setLocations(data);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data, success } = await handleFetch("/api/users", "Failed to fetch users");
            if (success) {
                setUsers(data);
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

        console.log('Display names generated:', displayNames);
        console.log('Schema fields:', schemaFields);
        return displayNames;
    };

    const getOptionsMap = () => {
        console.log(locations.map(location => ({
            value: location.id,
            label: location.name,
        })), users.filter(user => user.role === 'admin' || user.role === 'organizer').map(user => ({
            value: user.id,
            label: user.name,
        })), 'users and locations', users, locations);
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

        // Extract default values from schema
        const schemaDefaults = extractSchemaDefaults(schema);

        // Override with initial data if provided
        if (initialData) {
            // Only include fields that exist in the schema
            const schemaKeys = Object.keys(schema.shape);
            const filteredInitialData = Object.keys(initialData).reduce((acc, key) => {
                if (schemaKeys.includes(key)) {
                    acc[key] = (initialData as any)[key];
                }
                return acc;
            }, {} as Record<string, any>);

            const finalDefaults = {
                ...schemaDefaults,
                ...filteredInitialData,
            };

            // Ensure date fields are proper Date objects
            if ((finalDefaults as any).startDate && typeof (finalDefaults as any).startDate === 'string') {
                (finalDefaults as any).startDate = new Date((finalDefaults as any).startDate);
            }
            if ((finalDefaults as any).endDate && typeof (finalDefaults as any).endDate === 'string') {
                (finalDefaults as any).endDate = new Date((finalDefaults as any).endDate);
            }

            console.log('Final defaults with initial data:', finalDefaults);
            return finalDefaults;
        }

        console.log('Schema defaults:', schemaDefaults);
        return schemaDefaults;
    };

    return (
        <div className="space-y-6">
            <ConfigurableForm
                formSchema={getSchema()}
                endpoint={initialData ? `/events/${initialData.id}` : '/events'}
                entityName="event"
                displayNames={getDisplayNames()}
                defaultValues={initialData ? getDefaultValues() : undefined}
                buttonTitle={initialData ? "Update Event" : "Create Event"}
                headerTitle={`${initialData ? "Edit" : "Add New"} ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`}
                loadingTitle="Saving..."
                exclusionList={["type"]}
                optionsMap={getOptionsMap()}
                imagesList={["images"]}
                dateOnlyList={["startDate", "endDate"]}
                coordinatesList={["coordinates"]}
                inputList={["videoLinks"]}
                className="grid gap-4 overflow-x-scroll"
                endpointType={initialData ? "PATCH" : "POST"}
                onFormSuccess={onFormSuccess}
            />

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

"use client";

import { ConfigurableForm } from "@/components/common/configurable-form";
import { formatFieldName, getSchemaFields } from "@/utils";
import { Button } from "@/components/ui/button";
import { locationSchema } from "@/lib/zod";
import type { Location } from "@/types";
import type { z } from "zod";

type LocationInput = z.infer<typeof locationSchema>;

interface LocationFormProps {
    initialData?: Location | null;
    onSubmit: (data: Record<string, unknown>) => void;
    onCancel: () => void;
}

export function LocationForm({ initialData, onSubmit, onCancel }: LocationFormProps) {
    const getDisplayNames = () => {
        // Extract display names from schema shape
        const schemaFields = getSchemaFields(locationSchema);

        // Create display names using the utility function
        const displayNames: Record<string, string> = {};

        for (const field of schemaFields) {
            displayNames[field] = formatFieldName(field);
        }

        return displayNames;
    };

    const getDefaultValues = () => {
        try {
            // Parse with minimal data to get defaults from Zod schema
            const baseDefaults = locationSchema.parse({});

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
                name: "",
                address: "",
                city: "",
                country: "",
                coordinates: {
                    lat: 0,
                    lng: 0,
                },
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
                formSchema={locationSchema}
                endpoint=""
                entityName="location"
                displayNames={getDisplayNames()}
                defaultValues={getDefaultValues()}
                buttonTitle={initialData ? "Update Location" : "Create Location"}
                headerTitle={`${initialData ? "Edit" : "Add New"} Location`}
                switchList={undefined}
                loadingTitle="Saving..."
                className="space-y-4"
            />

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

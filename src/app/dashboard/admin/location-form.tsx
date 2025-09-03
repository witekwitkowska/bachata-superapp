"use client";

import { ConfigurableForm } from "@/components/common/configurable-form";
import { formatFieldName, getSchemaFields, extractSchemaDefaults } from "@/utils";
import { Button } from "@/components/ui/button";
import { locationSchema } from "@/lib/zod";
import type { Location } from "@/types";
import type { z } from "zod";

type LocationInput = z.infer<typeof locationSchema>;

interface LocationFormProps {
    initialData?: Location | null;
    onSubmit: (data: Record<string, unknown>) => void;
    onCancel: () => void;
    onFormSuccess?: () => void; // New prop for table refresh
}

export function LocationForm({ initialData, onSubmit, onCancel, onFormSuccess }: LocationFormProps) {
    const getDisplayNames = () => {
        // Extract display names from schema shape
        const schemaFields = getSchemaFields(locationSchema);

        // Create display names using the utility function
        const displayNames: Record<string, string> = {};

        for (const field of schemaFields) {
            displayNames[field] = formatFieldName(field);
        }

        console.log('Location form - Display names generated:', displayNames);
        console.log('Location form - Schema fields:', schemaFields);
        return displayNames;
    };

    const getDefaultValues = () => {
        // Extract default values from schema
        const schemaDefaults = extractSchemaDefaults(locationSchema);

        // Override with initial data if provided
        if (initialData) {
            // Only include fields that exist in the schema
            const schemaKeys = Object.keys(locationSchema.shape);
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
            console.log('Location form - Final defaults with initial data:', finalDefaults);
            return finalDefaults;
        }

        console.log('Location form - Schema defaults:', schemaDefaults);
        return schemaDefaults;
    };

    return (
        <div className="space-y-6">
            <ConfigurableForm
                formSchema={locationSchema}
                endpoint="/locations"
                entityName="location"
                endpointType={initialData ? "PATCH" : "POST"}
                displayNames={getDisplayNames()}
                defaultValues={initialData ? getDefaultValues() : undefined}
                buttonTitle={initialData ? "Update Location" : "Create Location"}
                headerTitle={`${initialData ? "Edit" : "Add New"} Location`}
                loadingTitle="Saving..."
                className="space-y-4"
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

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

        return displayNames;
    };

    const getDefaultValues = () => {
        // Extract default values from schema
        const schemaDefaults = extractSchemaDefaults(locationSchema);

        // Override with initial data if provided
        if (initialData) {
            console.log('LocationForm - initialData:', initialData);
            console.log('LocationForm - schemaKeys:', Object.keys(locationSchema.shape));

            // Only include fields that exist in the schema
            const schemaKeys = Object.keys(locationSchema.shape);
            const filteredInitialData = Object.keys(initialData).reduce((acc, key) => {
                if (schemaKeys.includes(key)) {
                    acc[key] = (initialData as any)[key];
                }
                return acc;
            }, {} as Record<string, any>);

            console.log('LocationForm - filteredInitialData:', filteredInitialData);

            // Ensure all schema fields are included, even if not in initialData
            const allSchemaFields: Record<string, any> = {};
            for (const fieldName of Object.keys(locationSchema.shape)) {
                allSchemaFields[fieldName] = filteredInitialData[fieldName] ?? (schemaDefaults as any)[fieldName] ?? undefined;
            }

            console.log('LocationForm - finalDefaults:', allSchemaFields);
            return allSchemaFields;
        }

        // If no initial data, ensure we have defaults for all schema fields
        if (Object.keys(schemaDefaults).length === 0) {
            const allFieldsDefaults: Record<string, any> = {};
            for (const fieldName of Object.keys(locationSchema.shape)) {
                allFieldsDefaults[fieldName] = undefined;
            }
            return allFieldsDefaults;
        }

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
                defaultValues={getDefaultValues()}
                buttonTitle={initialData ? "Update Location" : "Create Location"}
                headerTitle={`${initialData ? "Edit" : "Add New"} Location`}
                loadingTitle="Saving..."
                className="space-y-4"
                coordinatesList={["coordinates"]}
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

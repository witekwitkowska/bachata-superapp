"use client";

import { ConfigurableForm } from "@/components/common/configurable-form";
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
    const displayNames = {
        name: "Name",
        address: "Address",
        city: "City",
        country: "Country",
        "coordinates.lat": "Latitude",
        "coordinates.lng": "Longitude",
    };

    const defaultValues = initialData || {
        name: "",
        address: "",
        city: "",
        country: "",
        coordinates: {
            lat: undefined,
            lng: undefined,
        },
    };

    return (
        <div className="space-y-6">
            <ConfigurableForm
                formSchema={locationSchema}
                endpoint=""
                entityName="location"
                displayNames={displayNames}
                defaultValues={defaultValues}
                buttonTitle={initialData ? "Update Location" : "Create Location"}
                headerTitle={`${initialData ? "Edit" : "Add New"} Location`}
                switchList={["published"]}
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

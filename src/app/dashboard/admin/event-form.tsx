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

    useEffect(() => {
        fetchLocations();
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
        const baseDisplayNames = {
            title: "Title",
            description: "Description",
            time: "Date & Time",
            isPaid: "Paid Event",
            locationId: "Location",
            published: "Published",
            price: "Price",
            currency: "Currency",
            maxAttendees: "Max Attendees",
        };

        const socialDisplayNames = {
            ...baseDisplayNames,
            musicStyle: "Music Style",
            dressCode: "Dress Code",
            includesFood: "Includes Food",
            includesDrinks: "Includes Drinks",
        };

        const festivalDisplayNames = {
            ...baseDisplayNames,
            startDate: "Start Date",
            endDate: "End Date",
            performers: "Performers",
        };

        const privateSessionDisplayNames = {
            ...baseDisplayNames,
            teacherId: "Teacher ID",
            studentId: "Student ID",
            duration: "Duration (minutes)",
            skillLevel: "Skill Level",
            notes: "Notes",
        };

        const workshopDisplayNames = {
            ...baseDisplayNames,
            teacherId: "Teacher ID",
            maxStudents: "Max Students",
            skillLevel: "Skill Level",
            materials: "Materials",
            prerequisites: "Prerequisites",
        };

        switch (eventType) {
            case "social":
                return socialDisplayNames;
            case "festival":
                return festivalDisplayNames;
            case "private-session":
                return privateSessionDisplayNames;
            case "workshop":
                return workshopDisplayNames;
            default:
                return baseDisplayNames;
        }
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
        };

        return baseOptionsMap;
    };

    const getDefaultValues = () => {
        const baseDefaults = {
            title: "",
            description: "",
            time: new Date(),
            isPaid: false,
            locationId: "",
            published: false,
            price: 0,
            currency: "USD",
            maxAttendees: undefined,
        };


        if (initialData) {
            return {
                ...baseDefaults,
                ...initialData,
            };
        }

        return baseDefaults;
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
                selectorList={["locationId", "currency", "skillLevel"]}
                switchList={["isPaid", "published"]}
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

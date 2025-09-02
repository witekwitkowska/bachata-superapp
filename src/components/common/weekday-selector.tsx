"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WeekdaySelectorProps {
    value?: string[];
    onChange?: (value: string[]) => void;
    label?: string;
    className?: string;
}

const weekdays = [
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" },
];

export function WeekdaySelector({
    value = [],
    onChange,
    label = "Days of Week",
    className = ""
}: WeekdaySelectorProps) {
    const selectedDays = value || [];

    const handleDayToggle = (day: string) => {
        if (!onChange) return;

        const newSelection = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day];

        onChange(newSelection);
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <Label className="px-1">
                {label}
            </Label>
            <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                    <Button
                        key={day.value}
                        type="button"
                        variant={selectedDays.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => handleDayToggle(day.value)}
                    >
                        {day.label}
                    </Button>
                ))}
            </div>
        </div>
    )
}

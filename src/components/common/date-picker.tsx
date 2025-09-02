"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date | string;
    onChange?: (value: Date | string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export function DatePicker({
    value,
    onChange,
    label = "Date",
    placeholder = "Select date",
    className = ""
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)

    // Parse the value to get date
    const parseValue = React.useCallback((val: Date | string | undefined): Date | undefined => {
        if (!val) return undefined;

        if (val instanceof Date) {
            return val;
        }

        // If it's a string, try to parse it
        try {
            const date = new Date(val);
            if (Number.isNaN(date.getTime())) {
                return undefined;
            }
            return date;
        } catch {
            return undefined;
        }
    }, []);

    const selectedDate = parseValue(value);

    const handleDateSelect = (newDate: Date | undefined) => {
        if (newDate && onChange) {
            onChange(newDate);
        }
        setOpen(false);
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <Label htmlFor="date-picker" className="px-1">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker"
                        className="w-40 justify-between font-normal h-10"
                    >
                        {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
                        <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        captionLayout="dropdown"
                        className="w-[300px]"
                        onSelect={handleDateSelect}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

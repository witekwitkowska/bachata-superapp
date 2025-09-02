"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
    value?: Date | string;
    onChange?: (value: Date | string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export function DateTimePicker({
    value,
    onChange,
    label = "Date & Time",
    placeholder = "Select date and time",
    className = ""
}: DateTimePickerProps) {
    const [open, setOpen] = React.useState(false)

    // Parse the value to get date and time
    const parseValue = React.useCallback((val: Date | string | undefined): { date: Date | undefined; time: string } => {
        if (!val) return { date: undefined, time: "00:00:00" };

        if (val instanceof Date) {
            return {
                date: val,
                time: val.toTimeString().slice(0, 8)
            };
        }

        // If it's a string, try to parse it
        try {
            const date = new Date(val);
            if (Number.isNaN(date.getTime())) {
                return { date: undefined, time: "00:00:00" };
            }
            return {
                date,
                time: date.toTimeString().slice(0, 8)
            };
        } catch {
            return { date: undefined, time: "00:00:00" };
        }
    }, []);

    const { date, time } = parseValue(value);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
    const [selectedTime, setSelectedTime] = React.useState<string>(time);

    // Update internal state when value prop changes
    React.useEffect(() => {
        const { date: newDate, time: newTime } = parseValue(value);
        setSelectedDate(newDate);
        setSelectedTime(newTime);
    }, [value, parseValue]);

    const handleDateSelect = (newDate: Date | undefined) => {
        setSelectedDate(newDate);
        if (newDate && onChange) {
            // Combine date and time
            const [hours, minutes, seconds] = selectedTime.split(':').map(Number);
            newDate.setHours(hours, minutes, seconds);
            onChange(newDate);
        }
    };

    const handleTimeChange = (newTime: string) => {
        setSelectedTime(newTime);
        if (selectedDate && onChange) {
            // Combine date and time
            const [hours, minutes, seconds] = newTime.split(':').map(Number);
            const combinedDate = new Date(selectedDate);
            combinedDate.setHours(hours, minutes, seconds);
            onChange(combinedDate);
        }
    };

    const displayValue = selectedDate ? `${selectedDate.toLocaleDateString()} ${selectedTime}` : placeholder;

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <div className="flex flex-col gap-3">
                <Label htmlFor="date-picker" className="px-1">
                    Date
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-picker"
                            className="w-32 justify-between font-normal"
                        >
                            {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            className="w-[300px]"
                            mode="single"
                            selected={selectedDate}
                            captionLayout="dropdown"
                            onSelect={(newDate) => {
                                handleDateSelect(newDate);
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex flex-col gap-3">
                <Label htmlFor="time-picker" className="px-1">
                    Time
                </Label>
                <Input
                    type="time"
                    id="time-picker"
                    step="1"
                    value={selectedTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
            </div>
        </div>
    )
}

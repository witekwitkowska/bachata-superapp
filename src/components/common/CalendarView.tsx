"use client";

import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar as CalendarIcon, Users, Music } from "lucide-react";
import { format, isSameDay } from "date-fns";
import type { SearchResult } from "@/app/page-template";

interface CalendarViewProps {
    results: SearchResult[];
    onEventClick?: (eventId: string) => void;
}

export function CalendarView({ results, onEventClick }: CalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Filter out artists and only show events with dates
    const eventsWithDates = useMemo(() => {
        return results.filter(
            (result) => result.type !== "artist" && (result.date || (result as any).startDate || (result as any).time)
        );
    }, [results]);

    // Group events by date
    const eventsByDate = useMemo(() => {
        const grouped: Record<string, SearchResult[]> = {};

        eventsWithDates.forEach((event) => {
            // Try different date fields: date, startDate, time
            let eventDate: Date | null = null;

            // Priority: date > startDate > time
            const dateValue = event.date || (event as any).startDate || (event as any).time;

            if (dateValue) {
                // Handle both string and Date objects
                if (typeof dateValue === 'string') {
                    eventDate = new Date(dateValue);
                } else if (dateValue instanceof Date) {
                    eventDate = dateValue;
                } else {
                    // Try to parse as date
                    const parsed = new Date(dateValue);
                    if (!isNaN(parsed.getTime())) {
                        eventDate = parsed;
                    }
                }
            }

            if (eventDate && !isNaN(eventDate.getTime())) {
                const dateKey = format(eventDate, "yyyy-MM-dd");
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(event);
            }
        });

        return grouped;
    }, [eventsWithDates]);

    // Get dates that have events for calendar highlighting
    const datesWithEvents = useMemo(() => {
        return Object.keys(eventsByDate).map((dateKey) => new Date(dateKey));
    }, [eventsByDate]);

    // Get events for selected date
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        const dateKey = format(selectedDate, "yyyy-MM-dd");
        return eventsByDate[dateKey] || [];
    }, [selectedDate, eventsByDate]);


    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case "festival":
                return <Music className="h-4 w-4" />;
            case "social":
                return <Users className="h-4 w-4" />;
            case "workshop":
                return <CalendarIcon className="h-4 w-4" />;
            case "private-session":
                return <Users className="h-4 w-4" />;
            default:
                return <CalendarIcon className="h-4 w-4" />;
        }
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case "festival":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case "social":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "workshop":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "private-session":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Calendar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <style jsx global>{`
                .calendar-wrapper table {
                  width: 100%;
                  table-layout: fixed;
                }
                .calendar-wrapper td {
                  width: calc(100% / 7);
                  padding: 0;
                  text-align: center;
                  vertical-align: middle;
                }
                .calendar-wrapper button {
                  width: 100%;
                  height: 100%;
                  min-height: var(--cell-size);
                }
              `}</style>
                            <div className="relative calendar-wrapper">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border w-full"
                                    modifiers={{
                                        hasEvents: datesWithEvents,
                                    }}
                                    modifiersClassNames={{
                                        hasEvents: "font-semibold",
                                    }}
                                    classNames={{
                                        day: "relative text-center p-0 w-full",
                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                        day_today: "bg-accent text-accent-foreground font-semibold",
                                        week: "flex w-full",
                                        table: "w-full table-fixed",
                                    }}
                                    components={{
                                        DayButton: ({ day, modifiers, className, ...props }: any) => {
                                            const date = day.date || day;
                                            const dateKey = format(date, "yyyy-MM-dd");
                                            const dayEvents = eventsByDate[dateKey] || [];
                                            const hasEvents = dayEvents.length > 0;
                                            const isSelected = selectedDate && isSameDay(date, selectedDate);

                                            return (
                                                <Button
                                                    {...props}
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`relative w-full h-full aspect-square rounded-md transition-colors flex flex-col items-center justify-center gap-1 p-0 ${isSelected
                                                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                                                        : hasEvents
                                                            ? "bg-primary/10 hover:bg-primary/20 font-semibold"
                                                            : "hover:bg-muted"
                                                        } ${className || ""}`}
                                                >
                                                    <span className="text-sm font-medium leading-none">{format(date, "d")}</span>
                                                    {hasEvents && (
                                                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-0.5">
                                                            {dayEvents.slice(0, 3).map((_, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-blue-500 mb-8"
                                                                />
                                                            ))}
                                                            {dayEvents.length > 3 && (
                                                                <span className="text-[8px] leading-none text-red-500 font-semibold">
                                                                    +{dayEvents.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </Button>
                                            );
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Events List for Selected Date */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {selectedDate
                                    ? `Events on ${format(selectedDate, "MMMM d, yyyy")}`
                                    : "Select a date"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedDateEvents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No events on this date</p>
                                    {datesWithEvents.length > 0 && (
                                        <p className="text-xs mt-2">
                                            {datesWithEvents.length} date{datesWithEvents.length !== 1 ? "s" : ""} with events
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {selectedDateEvents.map((event) => (
                                        <Card
                                            key={event.id}
                                            className="cursor-pointer hover:shadow-md transition-shadow border"
                                            onClick={() => {
                                                if (onEventClick) {
                                                    onEventClick(event.id);
                                                }
                                            }}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start justify-between mb-2 gap-2">
                                                    <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                                                        {event.title || event.name}
                                                    </h4>
                                                    <Badge
                                                        className={`flex-shrink-0 ${getEventTypeColor(event.type)}`}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {getEventTypeIcon(event.type)}
                                                            <span className="text-xs capitalize hidden sm:inline">
                                                                {event.type.replace("-", " ")}
                                                            </span>
                                                        </div>
                                                    </Badge>
                                                </div>
                                                {event.location && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">{event.location}</span>
                                                    </p>
                                                )}
                                                {event.date && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                                        <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                                                        {new Date(event.date).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                )}
                                                {event.isPaid && event.price && (
                                                    <p className="text-xs font-medium mt-2">
                                                        {event.currency || "€"}
                                                        {event.price}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Upcoming Events Summary */}
            {eventsWithDates.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {eventsWithDates
                                .sort((a, b) => {
                                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                                    return dateA - dateB;
                                })
                                .slice(0, 6)
                                .map((event) => (
                                    <Card
                                        key={event.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => {
                                            if (onEventClick) {
                                                onEventClick(event.id);
                                            }
                                        }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                                                    {event.title || event.name}
                                                </h4>
                                                <Badge
                                                    className={`ml-2 flex-shrink-0 ${getEventTypeColor(event.type)}`}
                                                >
                                                    {getEventTypeIcon(event.type)}
                                                </Badge>
                                            </div>
                                            {event.date && (
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}
                                                </p>
                                            )}
                                            {event.location && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

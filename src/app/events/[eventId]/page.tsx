import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";
import { Event } from "@/types/event.types";
import { EventDetails } from "@/components/events/EventDetails";
import { Metadata } from "next";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { baseUrl } from "@/lib/utils";

interface EventPageProps {
    params: Promise<{
        eventId: string;
    }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    try {
        const event = await serverFetch(`${baseUrl}/api/events/${(await params).eventId}`, "Failed to fetch event");

        if (!event.success || !event.data) {
            return {
                title: "Event Not Found",
                description: "The requested event could not be found.",
            };
        }

        return {
            title: `${event.data.title} - Bachata Event`,
            description: event.data.description,
            openGraph: {
                title: event.data.title,
                description: event.data.description,
                images: event.data.images?.[0] ? [event.data.images[0]] : [],
            },
        };
    } catch (error) {
        return {
            title: "Event Not Found",
            description: "The requested event could not be found.",
        };
    }
}

export default async function EventPage({ params }: EventPageProps) {
    try {
        const { eventId } = await params;
        const event = await serverFetch(`${baseUrl}/api/events/${eventId}`, "Failed to fetch event");
        const session = await auth();
        if (!event.success || !event.data) {
            notFound();
        }

        return (
            <div className="w-full min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <EventDetails event={event.data as Event} session={session as Session} />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error fetching event:", error);
        notFound();
    }
}

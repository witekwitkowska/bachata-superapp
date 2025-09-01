import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EventAdminPage } from "../event-admin-page";
import { getCollection } from "@/lib/api/crud-generator";
import type { Event } from "@/types";

export default async function PrivateSessionsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch events on the server side
    const collection = await getCollection("events");
    const events = await collection.find({ type: "private-session" }).toArray();

    return (
        <EventAdminPage
            eventType="private-session"
            title="Private Sessions"
            description="Manage private dance lessons"
            initialEvents={events as unknown as Event[]}
        />
    );
}

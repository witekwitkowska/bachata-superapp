import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EventAdminPage } from "../event-admin-page";
import type { Event } from "@/types";
import { serverFetch } from "@/lib/server-fetch";

export default async function PrivateSessionsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch events on the server side
    const result = await serverFetch("/api/events?type=private-session", "Failed to fetch private session events");
    const events = result.success ? result.data : [];

    return (
        <EventAdminPage
            eventType="private-session"
            title="Private Sessions"
            description="Manage private dance lessons"
            initialEvents={events as Event[]}
        />
    );
}

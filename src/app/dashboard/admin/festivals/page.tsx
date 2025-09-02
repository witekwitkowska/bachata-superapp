import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EventAdminPage } from "../event-admin-page";
import type { Event } from "@/types";
import { serverFetch } from "@/lib/server-fetch";

export default async function FestivalsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch events on the server side
    const result = await serverFetch("/api/events?type=festival", "Failed to fetch festival events");
    const events = result.success ? result.data : [];

    return (
        <EventAdminPage
            eventType="festival"
            title="Festivals"
            description="Manage dance festivals"
            initialEvents={events as Event[]}
        />
    );
}

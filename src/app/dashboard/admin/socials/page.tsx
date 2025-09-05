import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EventAdminPage } from "../event-admin-page";
import { serverFetch } from "@/lib/server-fetch";
import type { Event } from "@/types";
import { baseUrl } from "@/lib/utils";

export default async function SocialsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (!["admin", "organizer"].includes(session.user.role)) {
        redirect("/dashboard");
    }

    // Fetch events through API route (handles serialization)
    const result = await serverFetch(`${baseUrl}/api/events?type=social${session.user.role === "organizer" ? `&organizerId=${session.user.id}` : ""}`, "Failed to fetch social events");
    const events = result.success ? result.data : [];

    return (
        <EventAdminPage
            eventType="social"
            title="Socials"
            description="Manage social dance events"
            initialEvents={events as Event[]}
        />
    );
}

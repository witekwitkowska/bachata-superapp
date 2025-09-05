import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EventAdminPage } from "../event-admin-page";
import type { Event } from "@/types";
import { serverFetch } from "@/lib/server-fetch";
import { baseUrl } from "@/lib/utils";

export default async function FestivalsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (!["admin", "organizer"].includes(session.user.role)) {
        redirect("/dashboard");
    }

    // Fetch events on the server side
    const result = await serverFetch(`${baseUrl}/api/events?type=festival${session.user.role === "organizer" ? `&organizerId=${session.user.id}` : ""}`, "Failed to fetch festival events");
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

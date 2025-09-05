import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EventAdminPage } from "../event-admin-page";
import { serverFetch } from "@/lib/server-fetch";
import type { Event } from "@/types";
import { baseUrl } from "@/lib/utils";

export default async function WorkshopsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (!["admin", "organizer"].includes(session.user.role)) {
        redirect("/dashboard");
    }

    // Fetch events on the server side  
    const result = await serverFetch(`${baseUrl}/api/events?type=workshop${session.user.role === "organizer" ? `&teacherId=${session.user.id}` : ""}`, "Failed to fetch workshop events");
    const events = result.success ? result.data : [];

    return (
        <EventAdminPage
            eventType="workshop"
            title="Workshops"
            description="Manage dance workshops"
            initialEvents={events as Event[]}
        />
    );
}

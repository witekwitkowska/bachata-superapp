import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EventAdminPage } from "../event-admin-page";
import { getCollection } from "@/lib/api/crud-generator";
import type { Event } from "@/types";

export default async function SocialsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch events on the server side
    const collection = await getCollection("events");
    const events = await collection.find({ type: "social" }).toArray();

    return (
        <EventAdminPage
            eventType="social"
            title="Socials"
            description="Manage social dance events"
            initialEvents={events as unknown as Event[]}
        />
    );
}

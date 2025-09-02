import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AllEventsClient } from "../all-events-client";
import type { Event } from "@/types";
import { serverFetch } from "@/lib/server-fetch";

export default async function AllEventsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const result = await serverFetch("/api/events", "Failed to fetch events");
    const events = result.success ? result.data : [];

    return <AllEventsClient initialEvents={events as Event[]} />;
}

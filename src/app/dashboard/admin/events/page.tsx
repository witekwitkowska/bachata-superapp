import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AllEventsClient } from "../all-events-client";
import { getCollection } from "@/lib/api/crud-generator";
import type { Event } from "@/types";

export default async function AllEventsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch all events on the server side
    const collection = await getCollection("events");
    const events = await collection.find({}).toArray();

    return <AllEventsClient initialEvents={events as unknown as Event[]} />;
}

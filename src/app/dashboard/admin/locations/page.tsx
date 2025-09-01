import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LocationsClient } from "../locations-client";
import { getCollection } from "@/lib/api/crud-generator";
import type { Location } from "@/types";

export default async function LocationsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch locations on the server side
    const collection = await getCollection("locations");
    const locations = await collection.find({}).toArray();

    return <LocationsClient initialLocations={locations as unknown as Location[]} />;
}

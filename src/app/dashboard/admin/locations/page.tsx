import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LocationsClient } from "../locations-client";
import { serverFetch } from "@/lib/server-fetch";
import type { Location } from "@/types";
import { baseUrl } from "@/lib/utils";

export default async function LocationsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch locations using serverFetch
    const result = await serverFetch(`${baseUrl}/api/locations`, "Failed to fetch locations");
    const locations = result.success ? result.data : [];

    return <LocationsClient initialLocations={locations as Location[]} />;
}

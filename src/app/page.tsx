import { handleFetch } from "@/lib/fetch";
import PageTemplate from "./page-template";
import { baseUrl } from "@/lib/utils";

export default async function Home() {
    let data: any = [];
    try {
        const usersData = await handleFetch(`${baseUrl}/api/users?published=true`, "Failed to fetch users");
        data.push(...(usersData?.data || []));

        const eventsData = await handleFetch(`${baseUrl}/api/events?published=true`, "Failed to fetch events");
        data.push(...(eventsData?.data || []));
    } catch (error) {
        console.error(error);
    }
    return <PageTemplate initialData={data || []} />;
}       
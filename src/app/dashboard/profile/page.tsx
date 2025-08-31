import { ProfileEdit } from "@/components/dashboard/ProfileEdit";
import { auth } from "@/auth";
import { serverFetch } from "@/lib/server-fetch";
import { baseUrl } from "@/lib/utils";
import { PageProps } from "next/types";


export default async function ProfilePage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const defaultValues = await searchParams;
    const session = await auth();

    if (!session?.user?.id) {
        return null; // This will trigger a redirect in the layout
    }

    const { data } = await serverFetch(`${baseUrl}/api/users-v2/${session.user.id}`, "Failed to load profile");
    return <ProfileEdit session={session} profile={data} defaultTab={defaultValues.tab || "information"} />;
}

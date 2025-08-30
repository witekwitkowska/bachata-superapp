import { ProfileEdit } from "@/components/dashboard/ProfileEdit";
import { auth } from "@/auth";
import { serverFetch } from "@/lib/server-fetch";
import { baseUrl } from "@/lib/utils";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        return null; // This will trigger a redirect in the layout
    }

    console.log(session, 'is session in profile page');
    const { data } = await serverFetch(`${baseUrl}/api/users-v2/${session.user.id}`, "Failed to load profile");
    console.log(data, 'is data in profile page');
    return <ProfileEdit session={session} profile={data} />;
}

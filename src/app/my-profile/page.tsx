import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export default async function About() {
  const session = await auth();
  
  // If user is not signed in, show 404
  if (!session?.user?.id) {
    notFound();
  }
  
  // Redirect to the logged-in user's profile page
  redirect(`/profile/${session.user.id}`);
}
import { TagsAdmin } from "@/components/admin/TagsAdmin";

export const metadata = {
    title: "Tags Management - Admin",
    description: "Manage website tags and categories",
};

export default function TagsAdminPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <TagsAdmin />
        </div>
    );
}

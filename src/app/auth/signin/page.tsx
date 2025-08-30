import { AuthForm } from "@/components/auth/AuthForm";

export default function SignInPage() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4">
            <AuthForm mode="login" />
        </div>
    );
}

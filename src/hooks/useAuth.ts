"use client";

import { handlePost } from "@/lib/fetch";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        // Wait a moment for session to update, then redirect
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/dashboard");
        return { success: true };
      }

      // If we get here, login failed without a specific error
      return {
        success: false,
        error: "Login failed. Please check your credentials.",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    recaptchaToken: string;
  }) => {
    setIsLoading(true);
    try {
      // handlePost throws on error, returns response on success
      await handlePost("/api/auth/register", userData, "Registration failed");

      // If we get here, registration was successful
      // Auto-login after successful registration
      const loginResult = await login(userData.email, userData.password);

      if (!loginResult.success) {
        // If auto-login fails, return error but don't redirect
        // User can manually navigate to sign-in page
        return {
          success: false,
          error:
            loginResult.error ||
            "Registration successful! Please sign in to continue.",
        };
      }

      // Login successful, redirect happens in login function
      return loginResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    try {
      const { success, error, message } = await handlePost(
        "/api/auth/change-password",
        passwordData,
        "Password change failed"
      );

      if (!success) {
        throw new Error(error || "Password change failed");
      }

      return { success: true, message: message };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Password change failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    status,
    isLoading,
    isAuthenticated: !!session,
    user: session?.user,
    login,
    loginWithGoogle,
    logout,
    register,
    changePassword,
  };
}

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface EnhancedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
  role: string;
  companyId?: string | null;
}

interface EnhancedSession {
  user: EnhancedUser;
  expires: string;
}

/**
 * Client-side hook that enhances the session with token data
 * This fetches the JWT token to get the full user information
 */
export function useEnhancedSession() {
  const { data: session, status } = useSession();
  const [enhancedSession, setEnhancedSession] =
    useState<EnhancedSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // Fetch the enhanced session data from our API
      fetch("/api/debug-auth")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.enhancedSession) {
            setEnhancedSession(data.enhancedSession);
          } else {
            // Fallback to raw session if enhancement fails
            setEnhancedSession(session as EnhancedSession);
          }
        })
        .catch((error) => {
          console.error("Failed to enhance session:", error);
          // Fallback to raw session
          setEnhancedSession(session as EnhancedSession);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setEnhancedSession(null);
      setLoading(false);
    }
  }, [session, status]);

  return {
    data: enhancedSession,
    status: loading ? "loading" : status,
    isLoading: loading,
  };
}

/**
 * Alternative: Direct API call to get enhanced session
 */
export async function getClientEnhancedSession(): Promise<EnhancedSession | null> {
  try {
    const response = await fetch("/api/debug-auth");
    const data = await response.json();

    if (data.success && data.enhancedSession) {
      return data.enhancedSession;
    }

    return null;
  } catch (error) {
    console.error("Failed to get enhanced session:", error);
    return null;
  }
}

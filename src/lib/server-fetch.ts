"use server";
import { headers } from "next/headers";

export async function serverFetch(url: string, errorMessage: string) {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    // Construct full URL if relative
    const fullUrl = url.startsWith("http")
      ? url
      : `${protocol}://${host}${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        // Add internal header to bypass auth
        "X-Internal-Call": "true",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(
        error instanceof Error ? error.message : error,
        "is error in serverFetch"
      );
      throw new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function serverPost(url: string, body: any, errorMessage: string) {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    // Construct full URL if relative
    const fullUrl = url.startsWith("http")
      ? url
      : `${protocol}://${host}${url}`;

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add internal header to bypass auth
        "X-Internal-Call": "true",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(
        "NOT OK",
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
      if (error.error) {
        throw new Error(error.error?.message);
      }
      throw new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function serverPatch(
  url: string,
  body: any,
  errorMessage: string
) {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    // Construct full URL if relative
    const fullUrl = url.startsWith("http")
      ? url
      : `${protocol}://${host}${url}`;

    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // Add internal header to bypass auth
        "X-Internal-Call": "true",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function serverPut(url: string, body: any, errorMessage: string) {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    // Construct full URL if relative
    const fullUrl = url.startsWith("http")
      ? url
      : `${protocol}://${host}${url}`;

    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Add internal header to bypass auth
        "X-Internal-Call": "true",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function serverDelete(url: string, errorMessage: string) {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    // Construct full URL if relative
    const fullUrl = url.startsWith("http")
      ? url
      : `${protocol}://${host}${url}`;

    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Add internal header to bypass auth
        "X-Internal-Call": "true",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

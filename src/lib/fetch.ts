import { toast } from "@/components/ui/toast";

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

interface ApiError extends Error {
  data?: any;
  status?: number;
}

async function handleRequest(
  url: string,
  options: FetchOptions = {},
  errorMessage: string = "Request failed"
): Promise<any> {
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Call": "true",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorMessage) as ApiError;
      error.data = errorData;
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    }
    throw error;
  }
}

export async function handleFetch(
  url: string,
  errorMessage: string = "Failed to fetch data"
): Promise<any> {
  return handleRequest(url, {}, errorMessage);
}

export async function handlePost(
  url: string,
  body: any,
  errorMessage: string = "Failed to post data"
): Promise<any> {
  return handleRequest(url, { method: "POST", body }, errorMessage);
}

export async function handlePut(
  url: string,
  body: any,
  errorMessage: string = "Failed to update data"
): Promise<any> {
  return handleRequest(url, { method: "PUT", body }, errorMessage);
}

export async function handlePatch(
  url: string,
  body: any,
  errorMessage: string = "Failed to patch data"
): Promise<any> {
  return handleRequest(url, { method: "PATCH", body }, errorMessage);
}

export async function handleDelete(
  url: string,
  errorMessage: string = "Failed to delete data"
): Promise<any> {
  return handleRequest(url, { method: "DELETE" }, errorMessage);
}

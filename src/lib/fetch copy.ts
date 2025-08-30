export class ExtendedError<T = unknown> extends Error {
  public data: T;
  public statusCode?: number;

  constructor(message: string, data: T) {
    super(message);
    this.name = this.constructor.name;
    this.data = data;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export async function handleFetch(url: string, errorMessage: string) {
  try {
    const response = await fetch(`${url}`);
    if (!response.ok) {
      const error = await response.json();
      const errorContext = {
        url,
        status: response.status,
        errorMessage,
        errorData: error,
        method: "GET",
      };

      const httpError = new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
      throw httpError;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function handlePost(url: string, body: any, errorMessage: string) {
  try {
    const response = await fetch(`${url}`, {
      method: "POST",
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

      // Track error with Sentry
      const errorContext = {
        url,
        status: response.status,
        errorMessage,
        errorData: error,
        method: "POST",
      };

      if (error.error) {
        const extendedError = new ExtendedError(
          error.error?.message,
          error.error?.data
        );
        throw extendedError;
      }

      const httpError = new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
      throw httpError;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function handlePatch(
  url: string,
  body: any,
  errorMessage: string
) {
  try {
    const response = await fetch(`${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      const errorContext = {
        url,
        status: response.status,
        errorMessage,
        errorData: error,
        method: "PATCH",
      };

      const httpError = new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
      throw httpError;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function handlePut(url: string, body: any, errorMessage: string) {
  try {
    const response = await fetch(`${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      const errorContext = {
        url,
        status: response.status,
        errorMessage,
        errorData: error,
        method: "PUT",
      };

      const httpError = new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
      throw httpError;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function handleDelete(url: string, errorMessage: string) {
  try {
    const response = await fetch(`${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const error = await response.json();
      const errorContext = {
        url,
        status: response.status,
        errorMessage,
        errorData: error,
        method: "DELETE",
      };

      const httpError = new Error(
        error.message ||
          error.error ||
          `${errorMessage} ${url} ${response.status}`
      );
      throw httpError;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

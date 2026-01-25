"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface FetchOptions extends RequestInit {
  body?: any; // Allow body to be an object, we will stringify it
}

export function useAuthFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const authFetch = useCallback(
    async (url: string, options: FetchOptions = {}) => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get Token
        const token = localStorage.getItem("accessToken");

        // 2. Prepare Headers
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...options.headers, // Allow overriding headers
        };

        if (token) {
          (headers as any)["Authorization"] = `Bearer ${token}`;
        }

        // 3. Prepare Body (Stringify if it's an object)
        let body = options.body;
        if (body && typeof body === "object" && !(body instanceof FormData)) {
          body = JSON.stringify(body);
        }

        // 4. Perform Fetch
        const response = await fetch(url, {
          ...options,
          headers,
          body,
        });

        // 6. Check for other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.detail ||
            errorData.error ||
            response.statusText ||
            "Request failed";
          console.log(error);
          throw new Error(errorMessage);
        }

        // 7. Return Data
        // Check if response has content before parsing JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        }
        return null; // or return true for success without body
      } catch (err: any) {
        setError(err.message);
        throw err; // Re-throw so the component can handle specific logic if needed
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  return { authFetch, loading, error };
}

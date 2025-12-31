"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function useFetchWithAuth() {
  const router = useRouter();

  const fetchWithAuth = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      // 1. Get the token (adjust key if you use 'token' or 'auth-token')
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      // 2. Prepare headers
      const headers: HeadersInit = {
        ...options.headers,
      };

      if (token) {
        (headers as Record<string, string>)[
          "Authorization"
        ] = `Bearer ${token}`;
      }

      // 3. Set Content-Type (skip for FormData to let browser set boundary)
      if (!(options.body instanceof FormData)) {
        (headers as Record<string, string>)["Content-Type"] =
          "application/json";
      }

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });

        // 4. Handle Unauthorized (401) - Optional Auto-Logout
        if (response.status === 401) {
          console.error("Unauthorized: Token may be expired");
          // localStorage.removeItem("accessToken")
          // router.push("/login")
          // return null // or throw, depending on preference
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || errorData.message || `Error ${response.status}`
          );
        }

        // 5. Handle empty responses (204 No Content)
        if (response.status === 204) {
          return null;
        }

        return await response.json();
      } catch (error) {
        throw error; // Re-throw so components can handle specific UI states
      }
    },
    [router]
  );

  return fetchWithAuth;
}

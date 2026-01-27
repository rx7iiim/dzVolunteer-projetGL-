"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom error types for better error handling
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class ServerError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "ServerError";
  }
}

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{
    message: string;
    type: "error" | "warning";
    details?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const APIURL = process.env.NEXT_PUBLIC_API_URL;

  // Check for existing access token and redirect if already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userString = localStorage.getItem("user");

    if (accessToken && userString) {
      try {
        const user = JSON.parse(userString);
        // Redirect based on user type
        if (
          user.user_type?.toLowerCase() === "admin" ||
          user.user_type === "ADMIN"
        ) {
          router.push("/admin/all-skills");
        } else if (
          user.user_type?.toLowerCase() === "organization" ||
          user.user_type === "ORGANIZATION"
        ) {
          router.push("/home");
        } else {
          router.push("/dashboard/home");
        }
      } catch (e) {
        // Invalid user data, clear storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
  }, [router]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (!validatePassword(password)) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    // Check if API URL is configured
    if (!APIURL) {
      setError({
        message: "Configuration Error",
        type: "error",
        details: "API endpoint is not configured. Please contact support.",
      });
      return;
    }

    setLoading(true);

    // Timeout for requests (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${APIURL}/api/accounts/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: controller.signal,
      });
      console.log(res);
      clearTimeout(timeoutId);

      // Parse response as JSON directly
      let data: any;

      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new ServerError(
          "Invalid response format from server. Please try again.",
          res.status,
        );
      }

      // Handle different HTTP status codes
      if (!res.ok) {
        switch (res.status) {
          case 400:
            throw new ValidationError(
              data.message || "Invalid email or password format",
            );
          case 401:
            throw new AuthenticationError(
              data.message || "Invalid email or password",
            );
          case 403:
            throw new AuthenticationError(
              "Account access denied. Please contact support if you believe this is an error.",
            );
          case 404:
            throw new AuthenticationError(
              "Account not found. Please check your credentials or create a new account.",
            );
          case 429:
            throw new ServerError(
              "Too many login attempts. Please try again in a few minutes.",
              429,
            );
          case 500:
          case 502:
          case 503:
          case 504:
            throw new ServerError(
              "Server is temporarily unavailable. Please try again later.",
              res.status,
            );
          default:
            throw new ServerError(
              data.message || `Login failed (Error ${res.status})`,
              res.status,
            );
        }
      }

      // Validate response data
      if (!data.user) {
        throw new ServerError("Invalid response from server");
      }
      console.log(data);

      // Store user data and tokens
      try {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.tokens) {
          localStorage.setItem("accessToken", data.tokens.access);
          localStorage.setItem("refreshToken", data.tokens.refresh);
        }
      } catch (storageError) {
        console.error("LocalStorage Error:", storageError);
        setError({
          message: "Storage Error",
          type: "warning",
          details:
            "Could not save session data. You may need to sign in again.",
        });
      }

      // Redirect based on user type
      if (
        data.user.user_type?.toLowerCase() === "admin" ||
        data.user.user_type === "ADMIN"
      ) {
        router.push("/admin/all-skills");
      } else if (
        data.user.user_type?.toLowerCase() === "organization" ||
        data.user.user_type === "ORGANIZATION"
      ) {
        router.push("/home");
      } else {
        router.push("/dashboard/home");
      }
    } catch (err: unknown) {
      console.error("Login Error:", err);

      // Handle abort (timeout)
      if (err instanceof Error && err.name === "AbortError") {
        setError({
          message: "Request Timeout",
          type: "error",
          details:
            "The server took too long to respond. Please check your connection and try again.",
        });
        return;
      }

      // Handle network errors
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError({
          message: "Network Error",
          type: "error",
          details:
            "Unable to connect to the server. Please check your internet connection.",
        });
        return;
      }

      // Handle custom error types
      if (err instanceof AuthenticationError) {
        setError({
          message: "Authentication Failed",
          type: "error",
          details: err.message,
        });
      } else if (err instanceof ValidationError) {
        setError({
          message: "Validation Error",
          type: "error",
          details: err.message,
        });
      } else if (err instanceof ServerError) {
        setError({
          message: "Server Error",
          type: "error",
          details: err.message,
        });
      } else if (err instanceof Error) {
        setError({
          message: "Unexpected Error",
          type: "error",
          details:
            err.message || "An unexpected error occurred. Please try again.",
        });
      } else {
        setError({
          message: "Unknown Error",
          type: "error",
          details:
            "An unknown error occurred. Please try again or contact support.",
        });
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
            <div className="text-2xl font-bold text-primary">DZ</div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your volunteer account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="border-destructive/20 bg-destructive/5"
            >
              <XCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">{error.message}</AlertTitle>
              <AlertDescription className="text-sm mt-1">
                {error.details}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors({ ...fieldErrors, email: undefined });
                  }
                }}
                disabled={loading}
                className={`h-10 ${
                  fieldErrors.email
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                required
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <p
                  id="email-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: undefined });
                  }
                }}
                disabled={loading}
                className={`h-10 ${
                  fieldErrors.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                required
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
              />
              {fieldErrors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary-active text-primary-foreground font-semibold transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                New to DZ-Volunteer?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-10 bg-transparent"
            onClick={() => router.push("/signup")}
            disabled={loading}
          >
            Create Account
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

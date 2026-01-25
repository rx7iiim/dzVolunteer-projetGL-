"use client";

import type React from "react";
import { useState } from "react";
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
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
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

class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationError";
  }
}

export default function SignUp() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    user_type: "volunteer",
    phone_number: "",
  });

  const [error, setError] = useState<{
    message: string;
    type: "error" | "warning";
    details?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string;
  }>({});

  const APIURL = process.env.NEXT_PUBLIC_API_URL;

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\d\s+()-]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 9;
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  // Unified handler for inputs and select
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    const {
      email,
      password,
      password_confirm,
      first_name,
      last_name,
      phone_number,
    } = formData;

    // Required fields
    if (!first_name.trim()) {
      errors.first_name = "First name is required";
    }
    if (!last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (phone_number && !validatePhone(phone_number)) {
      errors.phone_number = "Please enter a valid phone number";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (!validatePassword(password)) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!password_confirm) {
      errors.password_confirm = "Please confirm your password";
    } else if (password !== password_confirm) {
      errors.password_confirm = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
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

    try {
      console.log(formData);
      const res = await fetch(`${APIURL}/api/accounts/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log(res);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Registration failed (Error ${res})`);
      }

      // Store user data and tokens
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);

      // Redirect based on user type
      if (
        data.user.user_type?.toLowerCase() === "organization" ||
        data.user.user_type === "organization"
      ) {
        router.push("/home");
      } else {
        router.push("/dashboard/home");
      }
    } catch (err: unknown) {
      console.error("Registration Error:", err);

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
      if (err instanceof ValidationError) {
        setError({
          message: "Validation Error",
          type: "error",
          details: err.message,
        });
      } else if (err instanceof RegistrationError) {
        setError({
          message: "Registration Failed",
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
            <div className="text-2xl font-bold text-primary">DZ</div>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join our community today</CardDescription>
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

          <div className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  name="first_name"
                  placeholder="Ahmed"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={loading}
                  className={
                    fieldErrors.first_name
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                  required
                  aria-invalid={!!fieldErrors.first_name}
                />
                {fieldErrors.first_name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.first_name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  name="last_name"
                  placeholder="Benali"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={loading}
                  className={
                    fieldErrors.last_name
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                  required
                  aria-invalid={!!fieldErrors.last_name}
                />
                {fieldErrors.last_name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={
                  fieldErrors.email
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                required
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Phone Number{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </label>
              <Input
                name="phone_number"
                type="tel"
                placeholder="+213 555 12 34 56"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={loading}
                className={
                  fieldErrors.phone_number
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                aria-invalid={!!fieldErrors.phone_number}
              />
              {fieldErrors.phone_number && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.phone_number}
                </p>
              )}
            </div>

            {/* User Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">I am a...</label>
              <div className="relative">
                <select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  disabled={loading}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="organization">organization</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={
                  fieldErrors.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                required
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                name="password_confirm"
                type="password"
                placeholder="••••••••"
                value={formData.password_confirm}
                onChange={handleChange}
                disabled={loading}
                className={
                  fieldErrors.password_confirm
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                required
                aria-invalid={!!fieldErrors.password_confirm}
              />
              {fieldErrors.password_confirm && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password_confirm}
                </p>
              )}
            </div>

            <Button
              onClick={handleSignUp}
              className="w-full h-10 bg-primary hover:bg-primary-active text-primary-foreground font-semibold transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating Account...
                </div>
              ) : (
                "Register"
              )}
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-10 bg-transparent"
            onClick={() => router.push("/signin")}
            disabled={loading}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

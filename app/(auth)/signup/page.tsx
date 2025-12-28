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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// REMOVED: Imports from "@/components/ui/select" are gone.

export default function SignUp() {
  const router = useRouter();

  // 1. State matches the exact structure of your API body
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    user_type: "volunteer", // Default value
    phone_number: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Unified handler for both Inputs and Select
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 2. Client-side Validation
    const {
      email,
      username,
      password,
      password_confirm,
      first_name,
      last_name,
    } = formData;

    if (
      !email ||
      !username ||
      !password ||
      !password_confirm ||
      !first_name ||
      !last_name
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (password !== password_confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 3. Send exact JSON body required by API
      const res = await fetch("/api/v1/accounts/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // 4. Handle Response
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Received non-JSON response.");
      }

      const data = await res.json();

      if (!res.ok) {
        if (typeof data === "object" && data !== null) {
          const firstKey = Object.keys(data)[0];
          const firstError = Array.isArray(data[firstKey])
            ? data[firstKey][0]
            : data[firstKey];

          if (firstKey !== "message" && firstKey !== "detail") {
            throw new Error(`${firstKey.replace("_", " ")}: ${firstError}`);
          }
          throw new Error(data.message || data.detail || "Registration failed");
        }
        throw new Error("Registration failed. Please try again.");
      }

      // 5. Success: Store Tokens & Redirect
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration Error:", err);
      const msg = err.message || "Sign up failed.";
      setError(msg.charAt(0).toUpperCase() + msg.slice(1));
    } finally {
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join our community today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="border-destructive/20 bg-destructive/5"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
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
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  name="last_name"
                  placeholder="Benali"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                name="username"
                placeholder="username123"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                required
              />
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
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                name="phone_number"
                type="tel"
                placeholder="+213 555 12 34 56"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* User Type Selection - Standard HTML Select */}
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
                  <option value="volunteer">Volunteer</option>
                  <option value="organization">Organization</option>
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
                required
              />
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
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary-active text-primary-foreground font-semibold transition-colors"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

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

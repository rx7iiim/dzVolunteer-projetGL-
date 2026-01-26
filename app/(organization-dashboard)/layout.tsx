"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrganizationSidebar from "@/components/OrganizationSidebar";

export default function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if access token exists
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          // No access token, redirect to sign in
          router.push("/signin");
          return;
        }

        // Fetch user data to check user type
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/api/accounts/me/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          // Token invalid or expired, redirect to sign in
          localStorage.removeItem("accessToken");
          router.push("/signin");
          return;
        }

        const userData = await response.json();

        // Check if user type is organization
        if (userData.user?.user_type?.toLowerCase() !== "organization") {
          // User is not an organization, redirect to appropriate dashboard
          if (userData.user?.user_type?.toLowerCase() === "volunteer") {
            router.push("/dashboard/home"); // Assuming volunteer dashboard route
          } else {
            router.push("/"); // Default fallback
          }
          return;
        }

        // User is authenticated and is an organization, allow access
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("accessToken");
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <OrganizationSidebar />

      {/* Add left margin on desktop to account for fixed sidebar width (w-64) */}
      <main className="flex-1 overflow-auto transition-all duration-300 md:ml-64">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
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

        // Check if user type is admin
        if (userData.user?.user_type?.toLowerCase() !== "admin") {
          // User is not an admin, redirect to home or show unauthorized page
          router.push("/"); // Redirect to home for non-admins
          return;
        }

        // User is authenticated and is an admin, allow access
        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("accessToken");
        router.push("/signin");
      }
    };

    checkAuthAndRole();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      {/* Add left margin on desktop to account for fixed sidebar width (w-64) */}
      <main className="flex-1 overflow-auto transition-all duration-300 md:ml-64">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
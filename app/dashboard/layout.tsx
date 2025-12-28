"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Compass,
  User,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  History,
  icons,
  Home,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/signin");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/signin");
  };

  if (!user) {
    return null;
  }

  const navItems = [
    { href: "/dashboard/home", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/browse", label: "Browse Missions", icon: Compass },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/profile", label: "Profile & Skills", icon: User },
    { href: "/dashboard/applications", label: "My Applications", icon: Clock },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-primary">
            DZ-Volunteer
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Make a difference
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-primary/10 hover:text-sidebar-primary transition-colors rounded-lg"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="px-2">
            <p className="text-sm font-semibold text-sidebar-foreground">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}

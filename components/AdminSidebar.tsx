"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Menu,
  Shield,
  Lightbulb,
  AlertTriangle,
  Award,
  Upload,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      title: "SDG Import",
      href: "/admin/sdg-import",
      icon: Upload,
    },
    {
      title: "Pending Verifications",
      href: "/admin/skills-verification",
      icon: Clock,
    },
    {
      title: "All Skills",
      href: "/admin/all-skills",
      icon: Award,
    },
    {
      title: "Verified Skills",
      href: "/admin/verified-skills",
      icon: CheckCircle,
    },
    {
      title: "Bulk Skills Import",
      href: "/admin/bulk-skills-import",
      icon: Upload,
    },
    {
      title: "Skill Statistics",
      href: "/admin/skill-statistics",
      icon: BarChart3,
    },
    {
      title: "Skill Suggestions",
      href: "/admin/skill-suggestions",
      icon: Lightbulb,
    },
    {
      title: "Skill Requirements",
      href: "/admin/skill-requirements",
      icon: AlertTriangle,
    },
    {
      title: "Review Skill",
      href: "/admin/skill-review",
      icon: Eye,
    },
    {
      title: "Direct Verification",
      href: "/admin/direct-skill-verification",
      icon: FileCheck,
    },
    {
      title: "Verification Requests",
      href: "/admin/skill-verification-requests",
      icon: Award,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2 font-bold">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span>Admin Panel</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Admin Access</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

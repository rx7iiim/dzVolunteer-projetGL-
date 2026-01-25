"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import {
  Users,
  ChevronRight,
  Loader2,
  AlertCircle,
  Calendar,
  Briefcase,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Configuration
const APIURL = process.env.NEXT_PUBLIC_API_URL;

// Reusing the Mission Interface
interface Mission {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  organization_name: string;
  location: string;
  volunteers_needed: number;
  volunteers_approved: number;
  status: string;
}

export default function ApplicantsDirectoryPage() {
  const router = useRouter();
  const { authFetch, loading, error } = useAuthFetch();
  const [missions, setMissions] = useState<Mission[]>([]);

  // 1. Fetch Organization Missions
  const fetchMissions = useCallback(async () => {
    try {
      const data = await authFetch(`${APIURL}/api/missions/my-missions/`);
      setMissions(data || []);
    } catch (err) {
      console.error("Failed to load missions", err);
      // If 404/Empty, we just show empty list
      setMissions([]);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-700 hover:bg-green-100/80";
      case "draft":
        return "bg-slate-100 text-slate-700 hover:bg-slate-100/80";
      case "completed":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Applicant Management
        </h1>
        <p className="text-muted-foreground">
          Select a mission to review applications and manage volunteers.
        </p>
      </div>

      {error && !error.includes("No missions") && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {missions.length === 0 && !loading ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No Missions Found</h3>
          <p className="text-muted-foreground">
            You need to create a mission before you can receive applicants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <Card
              key={mission.id}
              className="group hover:shadow-md transition-all cursor-pointer border-slate-200"
              onClick={() =>
                router.push(`/apllyers/${mission.id}/participants`)
              }
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(mission.status)}
                  >
                    {mission.status}
                  </Badge>
                  {/* Visual indicator that this is clickable */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
                  {mission.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(mission.start_date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {mission.description}
                </p>

                {/* Progress Bar for Recruitment */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> Recruitment Progress
                    </span>
                    <span>
                      {mission.volunteers_approved} /{" "}
                      {mission.volunteers_needed}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        mission.volunteers_approved >= mission.volunteers_needed
                          ? "bg-green-500"
                          : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min((mission.volunteers_approved / mission.volunteers_needed) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between pl-0 hover:pl-2 transition-all"
                >
                  Manage Applicants
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

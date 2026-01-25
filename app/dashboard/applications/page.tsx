"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, CheckCircle, AlertCircle, Search } from "lucide-react";

// --- API Configuration ---
const APIURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---

// 1. Matches the JSON structure provided in the prompt
interface ApiApplication {
  id: string;
  mission_id: string;
  mission_title: string;
  organization_id: string;
  organization_name: string;
  status: string;
  application_message: string;
  applied_at: string;
  status_changed_at: string;
  mission_start_date: string;
  mission_end_date: string;
  actual_hours_worked: number | null;
  organization_rating: number | null;
  volunteer_rating: number | null;
  can_rate_organization: boolean;
  // These fields are needed for the UI but were missing in the specific JSON snippet.
  // We include them assuming the "Select Related: mission" provides them, or we fallback.
  location?: string;
  description?: string;
  estimated_total_hours?: number;
}

// 2. The wrapper structure based on the prompt
interface ApiResponse {
  applications: ApiApplication[];
  statistics: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
    cancelled: number;
  };
}

// 3. The internal type used by the UI components
interface Application {
  id: string;
  missionTitle: string;
  organization: string;
  status:
    | "accepted"
    | "pending"
    | "rejected"
    | "draft"
    | "completed"
    | "cancelled";
  appliedDate: string;
  hoursCompleted: number;
  hoursRequired: number;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
}

// --- Helper Functions ---
const formatDate = (dateString: string): string => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const mapApplicationStatus = (status: string): Application["status"] => {
  const normalized = status.toLowerCase();
  const validStatuses = [
    "accepted",
    "pending",
    "rejected",
    "draft",
    "completed",
    "cancelled",
  ];
  if (validStatuses.includes(normalized)) {
    return normalized as Application["status"];
  }
  return "pending";
};

// --- Custom Hook with Standard Fetch ---
function useMyApplications() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get Token from Local Storage
      let token = "";
      if (typeof window !== "undefined") {
        token = localStorage.getItem("accessToken") || "";
      }

      if (!token) {
        throw new Error("Please log in to view your applications.");
      }

      // 2. Perform Fetch
      const response = await fetch(`${APIURL}/api/missions/my-applications/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // 3. Handle HTTP Errors
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized. Please log in again.");
        }
        if (response.status === 404) {
          throw new Error("No applications found.");
        }
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }

      // 4. Parse & Transform Data
      const rawData: ApiResponse = await response.json();

      const transformedApps: Application[] = rawData.applications.map(
        (app) => ({
          id: app.id,
          missionTitle: app.mission_title,
          organization: app.organization_name,
          status: mapApplicationStatus(app.status),
          appliedDate: formatDate(app.applied_at),
          hoursCompleted: app.actual_hours_worked || 0,
          // Fallback to 0 or a default if estimated hours aren't in the partial response
          hoursRequired: app.estimated_total_hours || 10,
          location: app.location || "Location TBD",
          description:
            app.description || `Application for ${app.mission_title}`,
          startDate: formatDate(app.mission_start_date),
          endDate: formatDate(app.mission_end_date),
        }),
      );

      setData(transformedApps);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load applications";
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { data, loading, error, refetch: fetchApplications };
}

// --- Components ---
const ApplicationSkeleton = () => (
  <Card className="border-0 shadow-sm">
    <CardContent className="pt-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-destructive/5 rounded-xl border border-destructive/20">
    <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="h-6 w-6 text-destructive" />
    </div>
    <h3 className="text-lg font-semibold text-destructive">
      Failed to Load Applications
    </h3>
    <p className="text-muted-foreground max-w-sm mt-1 mb-6">{error}</p>
    <Button variant="outline" onClick={onRetry}>
      Try Again
    </Button>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/20 rounded-xl border border-dashed border-border">
    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
      <Search className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold">No Applications Yet</h3>
    <p className="text-muted-foreground max-w-sm mt-1 mb-6">
      You haven't applied to any missions yet. Browse available missions to get
      started!
    </p>
    <Button variant="outline">Browse Missions</Button>
  </div>
);

// --- Main Component ---
export default function ApplicationsPage() {
  const { data: applications, loading, error, refetch } = useMyApplications();

  // Local state to handle optimistic updates (like logging hours)
  const [localApplications, setLocalApplications] = useState<Application[]>([]);
  const [loggingHours, setLoggingHours] = useState<string | null>(null);
  const [hoursInput, setHoursInput] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Sync API data with local state
  useEffect(() => {
    if (applications.length > 0) {
      setLocalApplications(applications);
    }
  }, [applications]);

  const handleLogHours = (appId: string) => {
    const hours = Number.parseInt(hoursInput);
    if (hours > 0) {
      setLocalApplications(
        localApplications.map((app) =>
          app.id === appId
            ? {
                ...app,
                hoursCompleted: Math.min(
                  app.hoursCompleted + hours,
                  app.hoursRequired,
                ),
              }
            : app,
        ),
      );
      setLoggingHours(null);
      setHoursInput("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
      case "completed":
        return (
          <Badge className="bg-primary text-primary-foreground capitalize">
            {status}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-accent text-accent-foreground">Pending</Badge>
        );
      case "rejected":
      case "cancelled":
        return (
          <Badge className="bg-destructive text-destructive-foreground capitalize">
            {status}
          </Badge>
        );
      case "draft":
        return <Badge className="bg-muted text-muted-foreground">Draft</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
      case "completed":
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case "pending":
        return <Clock className="h-5 w-5 text-accent" />;
      case "rejected":
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "draft":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">My Applications</h1>
        <p className="text-lg text-muted-foreground">
          Track your volunteer mission applications and progress
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ApplicationSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && <ErrorState error={error} onRetry={refetch} />}

      {/* Empty State */}
      {!loading && !error && localApplications.length === 0 && <EmptyState />}

      {/* Applications List */}
      {!loading && !error && localApplications.length > 0 && (
        <div className="space-y-4">
          {localApplications.map((app) => (
            <Dialog
              key={app.id}
              open={loggingHours === app.id}
              onOpenChange={(open) => {
                setLoggingHours(open ? app.id : null);
                if (open) setSelectedApp(app);
              }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(app.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">
                          {app.missionTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {app.organization}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {app.location}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Start Date
                      </p>
                      <p className="font-medium text-foreground">
                        {app.startDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Hours</p>
                      <p className="font-medium text-foreground">
                        {app.hoursCompleted}/{app.hoursRequired}h
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Status</p>
                      <p className="font-medium text-foreground capitalize">
                        {app.status}
                      </p>
                    </div>
                  </div>

                  {app.status === "accepted" && (
                    <div className="w-full bg-border rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((app.hoursCompleted / (app.hoursRequired || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}

                  <DialogTrigger asChild>
                    <Button
                      variant={
                        app.status === "accepted" ? "outline" : "default"
                      }
                      className={`w-full ${app.status === "accepted" ? "" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                    >
                      {app.status === "accepted" ? "Log Hours" : "View Details"}
                    </Button>
                  </DialogTrigger>

                  {/* Details/Log Hours Dialog */}
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {app.status === "accepted"
                          ? `Log Hours for ${app.missionTitle}`
                          : app.missionTitle}
                      </DialogTitle>
                      <DialogDescription>
                        {app.organization} • {app.location}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <h3 className="font-semibold text-muted-foreground mb-2">
                          Description
                        </h3>
                        <p className="text-foreground text-sm">
                          {app.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Duration
                          </p>
                          <p className="font-medium text-foreground">
                            {app.startDate} - {app.endDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Hours Required
                          </p>
                          <p className="font-medium text-foreground">
                            {app.hoursRequired}h
                          </p>
                        </div>
                      </div>

                      {app.status === "accepted" && (
                        <>
                          <div className="border-t pt-4">
                            <label className="text-sm font-medium text-foreground">
                              Log Hours Completed
                            </label>
                            <p className="text-xs text-muted-foreground mb-2">
                              You have completed {app.hoursCompleted} out of{" "}
                              {app.hoursRequired} hours
                            </p>
                            <input
                              type="number"
                              min="0"
                              max={app.hoursRequired - app.hoursCompleted}
                              value={hoursInput}
                              onChange={(e) => setHoursInput(e.target.value)}
                              className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Enter hours"
                            />
                          </div>

                          <Button
                            onClick={() => handleLogHours(app.id)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={
                              !hoursInput || Number.parseInt(hoursInput) <= 0
                            }
                          >
                            Log Hours
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </CardContent>
              </Card>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}

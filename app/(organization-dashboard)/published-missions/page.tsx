"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Clock,
  Eye,
  ExternalLink,
  Loader2,
  AlertCircle,
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

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// --- Types ---
interface Mission {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  organization_name: string;
  sdg_title: string;
  sdg_number: number;
  location: string;
  volunteers_needed: number;
  volunteers_approved: number;
  status: string;
  estimated_total_hours: number;
}

export default function PublishedMissionsPage() {
  // --- State ---
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Logic ---
  const fetchPublishedMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch public endpoint (no auth required)
      const response = await fetch(`${APIURL}/api/missions/`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            errorData.error ||
            response.statusText ||
            "Request failed",
        );
      }

      const data = await response.json();

      // Normalize API response to always be an array
      if (Array.isArray(data)) {
        setMissions(data);
      } else if (data && Array.isArray(data.results)) {
        setMissions(data.results);
      } else if (data && Array.isArray(data.missions)) {
        setMissions(data.missions);
      } else {
        setMissions([]);
      }
    } catch (err: any) {
      setError(err.message);
      // If error is "No missions found...", we treat it as an empty list (success)
      if (!err.message.includes("No missions found")) {
        setMissions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchPublishedMissions();
  }, [fetchPublishedMissions]);

  // --- Helpers ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 3. Logic to determine if we should show the Empty State
  // We show empty state if missions is empty AND (there is no error OR the error is specifically the 404 message)
  const isListEmpty = missions.length === 0;
  const is404Error = error && error.includes("No missions found");
  const shouldShowEmptyState = !loading && (isListEmpty || is404Error);

  // We only show the red Alert box if there is a REAL error (not the 404 one)
  const shouldShowError = error && !is404Error;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Published Missions</h2>
          <p className="text-muted-foreground">
            All published missions available to volunteers.
          </p>
        </div>
      </div>

      {/* Error Message (Only for critical errors, not empty lists) */}
      {shouldShowError && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        // Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border bg-card text-card-foreground shadow-sm flex items-center justify-center"
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ))}
        </div>
      ) : shouldShowEmptyState ? (
        // Empty State
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50">
          <h3 className="text-lg font-medium">No published missions found</h3>
          <p className="text-muted-foreground mb-4">
            There are currently no published missions available.
          </p>
        </div>
      ) : (
        // Missions Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <Card key={mission.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge
                    variant="outline"
                    className={`mb-2 capitalize ${getStatusColor(mission.status)}`}
                  >
                    {mission.status}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1 text-lg">
                  {mission.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Globe className="h-3 w-3" /> SDG {mission.sdg_number}:{" "}
                  {mission.sdg_title}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {mission.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(mission.start_date)} -{" "}
                      {formatDate(mission.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{mission.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{mission.estimated_total_hours} Hours est.</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {mission.organization_name}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 flex flex-col items-start gap-3 border-t bg-slate-50/50">
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> Volunteers
                    </span>
                    <span>
                      {mission.volunteers_approved} /{" "}
                      {mission.volunteers_needed} Approved
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min((mission.volunteers_approved / mission.volunteers_needed) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div className="w-full flex justify-between pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/my-missions/${mission.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
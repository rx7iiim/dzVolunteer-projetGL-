"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MissionCard } from "@/components/mission-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  Globe,
  Briefcase,
  SlidersHorizontal,
  TrendingUp,
  MapPin,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import { CreateMissionButton } from "@/components/createmissionbutton";

// --- Types ---
interface ApiMission {
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

interface Mission {
  id: string;
  title: string;
  organization: string;
  location: string;
  date: string;
  hoursRequired: number;
  primarySDG: number;
  skillsRequired: string[];
  description: string;
  postedAt: string;
  volunteersNeeded: number;
  volunteersApproved: number;
  status: string;
}

interface FilterState {
  search: string;
  location: string;
  sdg: number | null;
}

// Base API URL
const APIURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper function to format date range
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Handle invalid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Date TBD";
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (startDate === endDate || start.toDateString() === end.toDateString()) {
    return formatDate(start);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
};

// --- Custom Hook for Data Logic ---
function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get Token from Local Storage
      let token = "";
      if (typeof window !== "undefined") {
        token = localStorage.getItem("accessToken") || "";
      }

      // 2. Prepare Headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 3. Perform Standard Fetch
      const response = await fetch(`${APIURL}/api/missions/`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in to view missions.");
        }
        const errorText = await response.text();
        throw new Error(`Failed to load missions: ${response.status}`);
      }

      const raw = await response.json();

      // Support both plain list and paginated `{ results: [...] }`
      const data: ApiMission[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.results)
          ? raw.results
          : [];

      const transformedMissions: Mission[] = data.map((mission) => ({
        id: mission.id,
        title: mission.title,
        organization: mission.organization_name,
        location: mission.location,
        date: formatDateRange(mission.start_date, mission.end_date),
        hoursRequired: mission.estimated_total_hours,
        primarySDG: mission.sdg_number,
        skillsRequired: [],
        description: mission.description,
        postedAt: mission.start_date,
        volunteersNeeded: mission.volunteers_needed,
        volunteersApproved: mission.volunteers_approved,
        status: mission.status,
      }));

      setMissions(transformedMissions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return {
    data: missions,
    loading,
    error,
    refetch: fetchMissions,
  };
}

// --- Components ---

const FeedSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    ))}
  </div>
);

const EmptyState = ({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/20 rounded-xl border border-dashed border-border">
    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
      <Search className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold">No missions found</h3>
    <p className="text-muted-foreground max-w-sm mt-1 mb-6">
      We couldn't find any opportunities matching your specific filters.
    </p>
    <Button variant="outline" onClick={onReset}>
      Clear all filters
    </Button>
  </div>
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
      Failed to Load Missions
    </h3>
    <p className="text-muted-foreground max-w-sm mt-1 mb-6">{error}</p>
    <Button variant="outline" onClick={onRetry}>
      Try Again
    </Button>
  </div>
);

export default function HomeFeedPage() {
  const { data: missions, loading, error, refetch } = useMissions();

  // Local Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "All",
    sdg: null,
  });

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = missions
      .map((mission) => mission.location)
      .filter(Boolean);
    return ["All", ...Array.from(new Set(locations))];
  }, [missions]);

  // Derived State (Memoized Filtering)
  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      const matchSearch =
        filters.search === "" ||
        mission.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        mission.organization
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        mission.description
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchLocation =
        filters.location === "All" || mission.location === filters.location;

      const matchSDG =
        filters.sdg === null || mission.primarySDG === filters.sdg;

      return matchSearch && matchLocation && matchSDG;
    });
  }, [missions, filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      location: "All",
      sdg: null,
    });
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Recently";

    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="w-full min-h-screen bg-background/50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container px-4 md:px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search missions, NGOs, or skills..."
                className="pl-9 bg-muted/40 border-muted-foreground/20 focus-visible:ring-1"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Mobile Filter Trigger (Hidden on Desktop) */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        {/* --- LEFT SIDEBAR (Filters) --- */}
        <aside className="col-span-1 md:col-span-3 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location Filter */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </h4>
                <div className="space-y-2">
                  {uniqueLocations.slice(0, 5).map((location) => (
                    <button
                      key={location}
                      onClick={() => handleFilterChange("location", location)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filters.location === location
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                  {uniqueLocations.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                    >
                      Show more...
                    </Button>
                  )}
                </div>
              </div>

              {/* SDG Filter */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> SDG Focus
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((sdg) => (
                    <Badge
                      key={sdg}
                      variant={filters.sdg === sdg ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() =>
                        handleFilterChange(
                          "sdg",
                          filters.sdg === sdg ? null : sdg,
                        )
                      }
                    >
                      SDG {sdg}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {(filters.search ||
                filters.location !== "All" ||
                filters.sdg !== null) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={resetFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Create Mission Button */}
          <div className="sticky top-24">
            <CreateMissionButton />
          </div>
        </aside>

        {/* --- CENTER FEED (Main Content) --- */}
        <main className="col-span-1 md:col-span-9 space-y-5">
          {/* Sort Header */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8 bg-border hidden sm:block" />
              <span className="text-xs text-muted-foreground">
                Showing {loading ? "..." : filteredMissions.length}{" "}
                {filteredMissions.length === 1
                  ? "opportunity"
                  : "opportunities"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Sort by: Recommended <Filter className="ml-1 h-3 w-3" />
            </Button>
          </div>

          {/* Error State */}
          {error && !loading && <ErrorState error={error} onRetry={refetch} />}

          {/* Loading State */}
          {loading && <FeedSkeleton />}

          {/* Empty State */}
          {!loading && !error && filteredMissions.length === 0 && (
            <EmptyState onReset={resetFilters} />
          )}

          {/* Loaded Data */}
          {!loading &&
            !error &&
            filteredMissions.length > 0 &&
            filteredMissions.map((mission) => (
              <div
                key={mission.id}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                {/* Feed Item Context */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground hover:underline cursor-pointer">
                      {mission.organization}
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgo(mission.postedAt)}</span>
                    {mission.location === "Remote" && (
                      <>
                        <span>•</span>
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                          <Globe className="h-3 w-3 mr-1" /> Remote
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* The Card */}
                <MissionCard {...mission} />

                {/* Social Actions */}
                <div className="mt-[-1px] relative z-10 bg-card border-x border-b border-border rounded-b-xl p-1 flex justify-between items-center px-2 shadow-sm mb-8">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      ❤️ Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      ↗ Share
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs text-muted-foreground"
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}

          {!loading && !error && filteredMissions.length > 0 && (
            <div className="py-8 flex justify-center">
              <Button variant="outline" className="w-full max-w-xs">
                Load more opportunities
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";

// --- Types ---
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
  postedAt: string; // ISO string
}

interface FilterState {
  search: string;
  location: string;
  sdg: number | null;
}

// --- API Layer (Simulated) ---
// In a real app, this would be an API call using fetch or axios
const fetchMissions = async (): Promise<Mission[]> => {
  // Simulating network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return [
    {
      id: "1",
      title: "Youth Mentorship Program",
      organization: "Future Leaders NGO",
      location: "Algiers",
      date: "Jan 15 - Feb 28, 2025",
      hoursRequired: 20,
      primarySDG: 4,
      skillsRequired: ["Mentoring", "Education"],
      description:
        "Help mentor young students in underprivileged areas to bridge the educational gap.",
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: "2",
      title: "Coastal Cleanup Initiative",
      organization: "Blue Ocean",
      location: "Oran",
      date: "Feb 10, 2025",
      hoursRequired: 5,
      primarySDG: 14,
      skillsRequired: ["Teamwork", "Physical Stamina"],
      description: "Join our massive cleanup drive along the Oran coastline.",
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "3",
      title: "Digital Literacy Workshop",
      organization: "Tech For All",
      location: "Remote",
      date: "March 01, 2025",
      hoursRequired: 10,
      primarySDG: 9,
      skillsRequired: ["Coding", "React", "Communication"],
      description: "Teach basic coding skills to NGO staff members.",
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "4",
      title: "Food Bank Logistics",
      organization: "Red Crescent",
      location: "Constantine",
      date: "Every Weekend",
      hoursRequired: 4,
      primarySDG: 2,
      skillsRequired: ["Logistics", "Driving"],
      description:
        "Assist in the distribution of food parcels to remote areas.",
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];
};

// --- Custom Hook for Data Logic ---
function useMissions() {
  const [data, setData] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchMissions();
        setData(result);
      } catch (err) {
        setError("Failed to load missions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return { data, loading, error };
}

// --- Components ---

const FeedSkeleton = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
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

export default function HomeFeedPage() {
  const { data: missions, loading, error } = useMissions();

  // Local Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "All",
    sdg: null,
  });

  // Derived State (Memoized Filtering)
  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      const matchSearch =
        mission.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        mission.organization
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchLocation =
        filters.location === "All" || mission.location === filters.location;
      // Add more complex SDG logic here if needed

      return matchSearch && matchLocation;
    });
  }, [missions, filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatTimeAgo = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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
        {/* --- LEFT SIDEBAR (Filters & Profile) --- */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-3 space-y-6">
          <Card className="border-border shadow-sm overflow-hidden sticky top-24">
            <div className="h-20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
            <CardContent className="pt-0 relative px-4 pb-6">
              <div className="h-16 w-16 rounded-full bg-background border-[3px] border-background absolute -top-8 flex items-center justify-center text-3xl shadow-sm">
                😎
              </div>
              <div className="mt-10">
                <h2 className="font-bold text-lg leading-tight">Sofiane B.</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Senior Volunteer • Constantine
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm group cursor-pointer">
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      Profile Views
                    </span>
                    <span className="font-medium text-primary">84</span>
                  </div>
                  <div className="flex justify-between text-sm group cursor-pointer">
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      Impact Hours
                    </span>
                    <span className="font-medium text-primary">120</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky top-[280px]">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Filter Feed
            </h3>
            <Card className="border-border shadow-sm">
              <CardContent className="p-4 space-y-5">
                {/* Location Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />{" "}
                    Location
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Algiers", "Oran", "Constantine", "Remote"].map(
                      (loc) => (
                        <Badge
                          key={loc}
                          variant={
                            filters.location === loc ? "default" : "secondary"
                          }
                          className="cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleFilterChange("location", loc)}
                        >
                          {loc}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div className="h-[1px] bg-border w-full" />

                {/* SDG Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" /> Causes
                  </label>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start h-8 px-2 text-sm font-normal text-muted-foreground hover:text-foreground"
                    >
                      <Briefcase className="mr-2 h-3.5 w-3.5" /> Decent Work
                      (SDG 8)
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start h-8 px-2 text-sm font-normal text-muted-foreground hover:text-foreground"
                    >
                      <TrendingUp className="mr-2 h-3.5 w-3.5" /> Quality
                      Education (SDG 4)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* --- CENTER FEED (Main Content) --- */}
        <main className="col-span-1 md:col-span-9 lg:col-span-6 space-y-5">
          {/* Sort Header */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8 bg-border hidden sm:block" />
              <span className="text-xs text-muted-foreground">
                Showing {loading ? "..." : filteredMissions.length}{" "}
                opportunities
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
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && <FeedSkeleton />}

          {/* Loaded Data */}
          {!loading && !error && filteredMissions.length === 0 && (
            <EmptyState
              onReset={() =>
                setFilters({ search: "", location: "All", sdg: null })
              }
            />
          )}

          {!loading &&
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

          {!loading && filteredMissions.length > 0 && (
            <div className="py-8 flex justify-center">
              <Button variant="outline" className="w-full max-w-xs">
                Load more opportunities
              </Button>
            </div>
          )}
        </main>

        {/* --- RIGHT SIDEBAR (Suggestions) --- */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <Card className="border-border shadow-sm sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Suggested NGOs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded bg-muted/80 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate hover:underline cursor-pointer">
                      Algeria Green
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      Environmental • Algiers
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 h-7 text-xs border-dashed hover:border-solid hover:bg-primary/5 hover:text-primary"
                    >
                      + Follow
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-3 border-t border-border bg-muted/10 rounded-b-lg">
              <Button
                variant="link"
                size="sm"
                className="w-full text-xs text-muted-foreground h-auto p-0"
              >
                View all recommendations
              </Button>
            </div>
          </Card>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground px-2 justify-center text-center">
            <a href="#" className="hover:underline">
              About
            </a>
            <a href="#" className="hover:underline">
              Help Center
            </a>
            <a href="#" className="hover:underline">
              Privacy & Terms
            </a>
            <span className="w-full mt-2">Volunteer Connect © 2025</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

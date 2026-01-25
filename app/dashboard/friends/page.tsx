"use client";

import { useState, useEffect } from "react";
import { MissionCard } from "@/components/mission-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, AlertCircle, Search } from "lucide-react";

// --- API Configuration ---
const APIURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---
interface ApiMission {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  organization_name: string;
  sdg_name: string;
  volunteers_needed: number;
  volunteers_approved: number;
  location?: string;
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
  volunteersNeeded: number;
  volunteersApproved: number;
}

// --- Helper Functions ---
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (startDate === endDate) {
    return formatDate(start);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
};

const mapSDGNameToNumber = (sdgName: string): number => {
  const sdgMap: { [key: string]: number } = {
    "No Poverty": 1,
    "Zero Hunger": 2,
    "Good Health and Well-being": 3,
    "Quality Education": 4,
    "Gender Equality": 5,
    "Clean Water and Sanitation": 6,
    "Affordable and Clean Energy": 7,
    "Decent Work and Economic Growth": 8,
    "Industry, Innovation and Infrastructure": 9,
    "Reduced Inequalities": 10,
    "Sustainable Cities and Communities": 11,
    "Responsible Consumption and Production": 12,
    "Climate Action": 13,
    "Life Below Water": 14,
    "Life on Land": 15,
    "Peace, Justice and Strong Institutions": 16,
    "Partnerships for the Goals": 17,
  };
  return sdgMap[sdgName] || 0;
};

// --- API Functions ---
const fetchFollowingMissions = async (token: string): Promise<Mission[]> => {
  const response = await fetch(`${APIURL}/following/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("You're not following any organizations yet");
    }
    throw new Error(`Failed to fetch missions: ${response.statusText}`);
  }

  const data: ApiMission[] = await response.json();

  return data.map((mission) => ({
    id: mission.id,
    title: mission.title,
    organization: mission.organization_name,
    location: mission.location || "Location TBD",
    date: formatDateRange(mission.start_date, mission.end_date),
    hoursRequired: 0, // API doesn't provide this
    primarySDG: mapSDGNameToNumber(mission.sdg_name),
    skillsRequired: [], // API doesn't provide this
    description: mission.description,
    volunteersNeeded: mission.volunteers_needed,
    volunteersApproved: mission.volunteers_approved,
  }));
};

// --- Custom Hook ---
function useFollowingMissions(token: string | null) {
  const [data, setData] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError(
          "Please log in to view missions from organizations you follow",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchFollowingMissions(token);
        setData(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load missions";
        setError(errorMessage);
        console.error("Error fetching following missions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const refetch = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchFollowingMissions(token);
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load missions";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// --- Components ---
const MissionSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
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

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/20 rounded-xl border border-dashed border-border">
    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
      <Search className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold">No Missions Available</h3>
    <p className="text-muted-foreground max-w-sm mt-1 mb-6">
      Start following organizations to see their missions here!
    </p>
    <Button variant="outline">Discover Organizations</Button>
  </div>
);

// --- Main Component ---
export default function BrowseMissionsPage() {
  // Get user token from localStorage
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const user = localStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          setUserToken(parsedUser.token || null);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  const {
    data: missions,
    loading,
    error,
    refetch,
  } = useFollowingMissions(userToken);
  const [appliedMissions, setAppliedMissions] = useState<string[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleApplyMission = (missionId: string) => {
    if (!appliedMissions.includes(missionId)) {
      setAppliedMissions([...appliedMissions, missionId]);
      setOpenDialog(false);
    }
  };

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setOpenDialog(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Browse Missions</h1>
        <p className="text-lg text-muted-foreground">
          Find volunteer opportunities from organizations you follow
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <MissionSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && <ErrorState error={error} onRetry={refetch} />}

      {/* Empty State */}
      {!loading && !error && missions.length === 0 && <EmptyState />}

      {/* Missions Grid */}
      {!loading && !error && missions.length > 0 && (
        <div className="grid gap-6">
          {missions.map((mission) => (
            <Dialog
              key={mission.id}
              open={openDialog && selectedMission?.id === mission.id}
              onOpenChange={setOpenDialog}
            >
              <DialogTrigger asChild>
                <div
                  onClick={() => handleViewMission(mission)}
                  className="cursor-pointer"
                >
                  <MissionCard {...mission} />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedMission?.title}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-foreground">
                    {selectedMission?.organization}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-muted-foreground">
                        Description
                      </h3>
                      <p className="text-foreground mt-2">
                        {selectedMission?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-muted-foreground">
                          Location
                        </h3>
                        <p className="text-foreground">
                          {selectedMission?.location}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-muted-foreground">
                          Duration
                        </h3>
                        <p className="text-foreground">
                          {selectedMission?.date}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-muted-foreground">
                          Volunteers Needed
                        </h3>
                        <p className="text-foreground">
                          {selectedMission?.volunteersApproved} /{" "}
                          {selectedMission?.volunteersNeeded}
                        </p>
                      </div>
                      {selectedMission?.skillsRequired &&
                        selectedMission.skillsRequired.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-muted-foreground">
                              Skills Needed
                            </h3>
                            <p className="text-foreground">
                              {selectedMission.skillsRequired.join(", ")}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  {appliedMissions.includes(selectedMission?.id || "") ? (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="pt-6 flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-primary">
                            Application Submitted
                          </p>
                          <p className="text-sm text-muted-foreground">
                            The organization will review your application
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      onClick={() =>
                        handleApplyMission(selectedMission?.id || "")
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg"
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, Calendar, Trophy } from "lucide-react";
import { missionService } from "@/lib/api/missions";

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

export default function CompletedMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedMissions = async () => {
      try {
        const response = await missionService.getCompletedMissions();
        const data = response?.data as any;

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
        if (err.response?.status === 404) {
          setError(
            err.response.data?.detail ||
              "You have not completed any missions yet.",
          );
        } else {
          setError(
            "Failed to fetch completed missions. Please try again later.",
          );
        }
        setMissions([]); // Ensure missions is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedMissions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Completed Missions
        </h1>
        <p className="text-lg text-muted-foreground">
          Missions you have successfully completed
        </p>
      </div>

      {missions?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              You have not completed any missions yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {missions?.map((mission) => (
            <Card key={mission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {mission.title}
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mission.organization_name}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-600 text-white">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-foreground">{mission.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Start Date
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(mission.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Estimated Hours
                        </p>
                        <p className="text-sm font-medium">
                          {mission.estimated_total_hours} hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="text-sm font-medium">
                          {mission.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Volunteers
                        </p>
                        <p className="text-sm font-medium">
                          {mission.volunteers_approved}/
                          {mission.volunteers_needed} approved
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      SDG Goal: {mission.sdg_number}. {mission.sdg_title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

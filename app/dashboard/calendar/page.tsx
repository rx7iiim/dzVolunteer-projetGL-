"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";
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

export default function CalendarPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchAcceptedMissions = async () => {
      try {
        const response = await missionService.getAcceptedMissions();
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
            err.response.data?.detail || "You have no accepted missions.",
          );
        } else {
          setError(
            "Failed to fetch accepted missions. Please try again later.",
          );
        }
        setMissions([]); // Ensure missions is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedMissions();
  }, []);

  // Helper functions to manipulate dates
  const startOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const endOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const isSameMonth = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const eachDayOfInterval = ({
    start,
    end,
  }: {
    start: Date;
    end: Date;
  }): Date[] => {
    const days: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const parseISO = (dateString: string): Date => {
    return new Date(dateString);
  };

  const format = (date: Date, pattern: string): string => {
    if (pattern === "MMMM yyyy") {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (pattern === "d") {
      return date.getDate().toString();
    } else if (pattern === "MMM d, yyyy") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return date.toString();
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMissionsForDate = (date: Date) => {
    return missions.filter((mission) => {
      const missionStartDate = parseISO(mission.start_date);
      return isSameDay(missionStartDate, date);
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

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
        <h1 className="text-3xl font-bold text-foreground">Mission Calendar</h1>
        <p className="text-lg text-muted-foreground">
          View your accepted missions on the calendar
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-accent"
            >
              &lt;
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="p-2 rounded-full hover:bg-accent"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-accent"
            >
              &gt;
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-medium py-2 text-sm text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day: Date, index: number) => {
              const dayMissions = getMissionsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={index}
                  className={`min-h-24 p-1 border rounded ${
                    isCurrentMonth
                      ? "bg-background"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div className="text-right text-sm font-medium">
                    {format(day, "d")}
                  </div>
                  <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                    {dayMissions.map((mission) => (
                      <div
                        key={mission.id}
                        className="text-xs p-1 bg-primary/10 rounded truncate hover:bg-primary/20 cursor-pointer"
                        title={`${mission.title} - ${mission.organization_name}`}
                      >
                        <div className="font-medium truncate">
                          {mission.title}
                        </div>
                        <div className="truncate text-muted-foreground">
                          {mission.organization_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Missions List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Missions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {missions
              .filter((mission) => new Date(mission.start_date) >= new Date())
              .sort(
                (a, b) =>
                  new Date(a.start_date).getTime() -
                  new Date(b.start_date).getTime(),
              )
              .slice(0, 5)
              .map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {mission.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {mission.organization_name}
                    </p>
                    <p className="text-sm mt-1">
                      <CalendarIcon className="inline h-3 w-3 mr-1" />
                      {format(
                        parseISO(mission.start_date),
                        "MMM d, yyyy",
                      )} • <Clock className="inline h-3 w-3 mr-1" />
                      {mission.estimated_total_hours} hours
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {mission.location}
                    </p>
                  </div>
                  <Badge variant="secondary">{mission.status}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  Layers,
  Award,
  RefreshCw,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const APIURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface VolunteerSkill {
  id: string;
  volunteer: string;
  volunteer_name?: string;
  volunteer_email?: string;
  skill: string;
  skill_name?: string;
  skill_category?: string;
  proficiency_level: string;
  years_of_experience: number;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
}

interface SkillStatistics {
  volunteer_id: string;
  total_skills: number;
  verified_skills: number;
  pending_verification: number;
  pending_verification_requests: number;
  proficiency_distribution: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
    Expert: number;
  };
  category_distribution: Record<string, number>;
  primary_skill: string;
}

export default function AdminDashboardPage() {
  const [skills, setSkills] = useState<VolunteerSkill[]>([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>("");
  const [manualVolunteerId, setManualVolunteerId] = useState<string>("");
  const [stats, setStats] = useState<SkillStatistics | null>(null);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all volunteer skills
  const fetchAllSkills = useCallback(async () => {
    try {
      setLoadingSkills(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found. Please sign in.");
      }

      const response = await fetch(`${APIURL}/api/volunteer-skills/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);

        if (response.status === 401) {
          throw new Error("Unauthorized. Please sign in again.");
        }
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.detail ||
              errorData.error ||
              `Request failed with status ${response.status}`,
          );
        } catch {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      const skillsList = Array.isArray(data) ? data : data.results || [];
      setSkills(skillsList);
    } catch (err: unknown) {
      console.error("Error fetching skills:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch skills");
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  // Fetch statistics for a specific volunteer
  const fetchVolunteerStats = useCallback(async (volunteerId: string) => {
    try {
      setLoadingStats(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found. Please sign in.");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/statistics/?volunteer_id=${volunteerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Stats API Error:", response.status, errorText);

        if (response.status === 400) {
          throw new Error("Invalid volunteer ID or volunteer_id is required.");
        }
        if (response.status === 403) {
          throw new Error("You can only view your own statistics.");
        }
        if (response.status === 404) {
          throw new Error("Volunteer not found.");
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.detail ||
              errorData.error ||
              `Request failed with status ${response.status}`,
          );
        } catch {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const statsData = await response.json();
      setStats(statsData);
    } catch (err: unknown) {
      console.error("Error fetching volunteer stats:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch volunteer statistics",
      );
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSkills();
  }, [fetchAllSkills]);

  const handleVolunteerClick = (volunteerId: string) => {
    setSelectedVolunteerId(volunteerId);
    setManualVolunteerId("");
    fetchVolunteerStats(volunteerId);
  };

  const handleManualIdSubmit = () => {
    if (manualVolunteerId.trim()) {
      setSelectedVolunteerId(manualVolunteerId.trim());
      fetchVolunteerStats(manualVolunteerId.trim());
    }
  };

  const handleClear = () => {
    setSelectedVolunteerId("");
    setManualVolunteerId("");
    setStats(null);
    setError(null);
  };

  const statCards = [
    {
      title: "Total Skills",
      value: stats?.total_skills || 0,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Verified Skills",
      value: stats?.verified_skills || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Verification",
      value: stats?.pending_verification || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Pending Requests",
      value: stats?.pending_verification_requests || 0,
      icon: Layers,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor volunteer skills and platform activity.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* All Volunteer Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Volunteer Skills</CardTitle>
            <CardDescription>
              Click on a volunteer to view their statistics
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllSkills}
            disabled={loadingSkills}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loadingSkills ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loadingSkills ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : skills.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No volunteer skills found.
            </p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Proficiency</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skills.slice(0, 20).map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {skill.volunteer_name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {skill.volunteer_email || skill.volunteer}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{skill.skill_name || skill.skill}</TableCell>
                      <TableCell>{skill.skill_category || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {skill.proficiency_level}
                        </Badge>
                      </TableCell>
                      <TableCell>{skill.years_of_experience} years</TableCell>
                      <TableCell>
                        {skill.is_verified ? (
                          <Badge className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVolunteerClick(skill.volunteer)}
                        >
                          View Stats
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {skills.length > 20 && (
                <div className="p-3 text-center text-sm text-muted-foreground border-t">
                  Showing 20 of {skills.length} skills
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Volunteer ID Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Volunteer Statistics</CardTitle>
          <CardDescription>
            Enter a volunteer ID to view their statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter volunteer UUID"
                value={manualVolunteerId}
                onChange={(e) => setManualVolunteerId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualIdSubmit()}
              />
            </div>
            <Button
              onClick={handleManualIdSubmit}
              disabled={!manualVolunteerId.trim()}
            >
              Load Stats
            </Button>
            {selectedVolunteerId && (
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
          {selectedVolunteerId && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing statistics for:{" "}
              <code className="bg-muted px-1 rounded">
                {selectedVolunteerId}
              </code>
            </p>
          )}
        </CardContent>
      </Card>

      {loadingStats && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Stats Cards - Only show when stats are loaded */}
      {stats && !loadingStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Primary Skill */}
          {stats.primary_skill && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Primary Skill
                </CardTitle>
                <CardDescription>
                  The volunteer&apos;s most prominent skill
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="text-lg px-4 py-2">
                  {stats.primary_skill}
                </Badge>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proficiency Distribution */}
            {stats.proficiency_distribution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Proficiency Distribution
                  </CardTitle>
                  <CardDescription>
                    Skills broken down by proficiency level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.proficiency_distribution).map(
                      ([level, count]) => (
                        <div
                          key={level}
                          className="flex justify-between items-center"
                        >
                          <span className="font-medium">{level}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Distribution */}
            {stats.category_distribution &&
              Object.keys(stats.category_distribution).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Category Distribution
                    </CardTitle>
                    <CardDescription>
                      Skills broken down by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats.category_distribution).map(
                        ([category, count]) => (
                          <div
                            key={category}
                            className="flex justify-between items-center"
                          >
                            <span className="font-medium">{category}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </>
      )}
    </div>
  );
}

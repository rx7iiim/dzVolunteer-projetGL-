"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface SkillStatistics {
  total_skills: number;
  verified_skills: number;
  pending_verifications: number;
  rejected_verifications: number;
  top_skills?: { name: string; count: number }[];
  monthly_trend?: { month: string; total: number; verified: number }[];
}

export default function SkillStatisticsPage() {
  const [stats, setStats] = useState<SkillStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/statistics/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || "Failed to fetch statistics",
        );
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      setError(err.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
      title: "Pending Verifications",
      value: stats?.pending_verifications || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Rejected Verifications",
      value: stats?.rejected_verifications || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Skill Statistics</h1>
        <p className="text-muted-foreground">
          View global statistics for all volunteer skills.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        {stats?.top_skills && stats.top_skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Skills
              </CardTitle>
              <CardDescription>
                Most common skills among volunteers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.top_skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span>{skill.name}</span>
                    <Badge variant="outline">{skill.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Trend */}
        {stats?.monthly_trend && stats.monthly_trend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Trend
              </CardTitle>
              <CardDescription>Skill growth over recent months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.monthly_trend.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-sm text-muted-foreground">
                        Total: {month.total}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(month.verified / month.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Verified: {month.verified}</span>
                      <span>
                        {Math.round((month.verified / month.total) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verification Status Summary */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Status Summary</CardTitle>
            <CardDescription>
              Overview of skill verification across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Verified</span>
                </div>
                <p className="text-2xl font-bold text-green-800 mt-2">
                  {stats.verified_skills}
                </p>
                <p className="text-sm text-green-600">
                  {stats.total_skills > 0
                    ? Math.round(
                        (stats.verified_skills / stats.total_skills) * 100,
                      )
                    : 0}
                  % of total
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-800 mt-2">
                  {stats.pending_verifications}
                </p>
                <p className="text-sm text-yellow-600">
                  {stats.total_skills > 0
                    ? Math.round(
                        (stats.pending_verifications / stats.total_skills) *
                          100,
                      )
                    : 0}
                  % of total
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Rejected</span>
                </div>
                <p className="text-2xl font-bold text-red-800 mt-2">
                  {stats.rejected_verifications}
                </p>
                <p className="text-sm text-red-600">
                  {stats.total_skills > 0
                    ? Math.round(
                        (stats.rejected_verifications / stats.total_skills) *
                          100,
                      )
                    : 0}
                  % of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

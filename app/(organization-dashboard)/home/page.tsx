"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// Define interfaces
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

interface Application {
  id: string;
  volunteer: {
    id: string;
    full_name: string;
    email: string;
  };
  mission: {
    id: string;
    title: string;
  };
  status: string;
  applied_at: string;
}

export default function OrganizationHomePage() {
  const [user, setUser] = useState<any>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    totalMissions: 0,
    activeMissions: 0,
    totalApplicants: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get access token
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        // Get user info
        const userResponse = await fetch(`${APIURL}/api/accounts/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        }

        // Get missions
        const missionsResponse = await fetch(
          `${APIURL}/api/missions/my-missions/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        let missionsData = [];
        if (missionsResponse.ok) {
          missionsData = await missionsResponse.json();
          setMissions(missionsData || []);
        }

        // Get applications
        const applicationsResponse = await fetch(
          `${APIURL}/api/applications/my-applications/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        let applicationsData = [];
        if (applicationsResponse.ok) {
          applicationsData = await applicationsResponse.json();
          setApplications(applicationsData || []);
        }

        // Calculate stats
        const totalMissions = missionsData?.length || 0;
        const activeMissions =
          missionsData?.filter((m: Mission) => m.status === "published")
            ?.length || 0;
        const totalApplicants =
          [
            ...new Set(
              applicationsData?.map((a: Application) => a.volunteer.id),
            ),
          ]?.length || 0;
        const pendingApplications =
          applicationsData?.filter((a: Application) => a.status === "pending")
            ?.length || 0;

        setStats({
          totalMissions,
          activeMissions,
          totalApplicants,
          pendingApplications,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const missionStatusData = [
    {
      name: "Published",
      value: missions.filter((m) => m.status === "published").length,
    },
    {
      name: "Draft",
      value: missions.filter((m) => m.status === "draft").length,
    },
    {
      name: "Completed",
      value: missions.filter((m) => m.status === "completed").length,
    },
  ];

  const applicationStatusData = [
    {
      name: "Pending",
      value: applications.filter((a) => a.status === "pending").length,
    },
    {
      name: "Approved",
      value: applications.filter((a) => a.status === "approved").length,
    },
    {
      name: "Rejected",
      value: applications.filter((a) => a.status === "rejected").length,
    },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Prepare recent missions data (top 3)
  const recentMissions = missions.slice(0, 3);

  // Prepare recent applications data (top 3)
  const recentApplications = applications.slice(0, 3);

  const statCards = [
    {
      title: "Total Missions",
      value: stats.totalMissions,
      change: "+2 since last week",
      icon: "🎯",
    },
    {
      title: "Active Missions",
      value: stats.activeMissions,
      change: "+1 since last week",
      icon: "🚀",
    },
    {
      title: "Total Applicants",
      value: stats.totalApplicants,
      change: "+12 since last week",
      icon: "👥",
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      change: "-3 since last week",
      icon: "⏳",
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.first_name || user?.full_name || "Organization"}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your missions today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Mission Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={missionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {missionStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Application Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Missions</h2>
          <div className="space-y-4">
            {recentMissions.length > 0 ? (
              recentMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium truncate max-w-xs">
                      {mission.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {mission.status.charAt(0).toUpperCase() +
                        mission.status.slice(1)}{" "}
                      • {mission.location}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      mission.status === "published"
                        ? "bg-green-100 text-green-800"
                        : mission.status === "draft"
                          ? "bg-slate-100 text-slate-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {mission.status.charAt(0).toUpperCase() +
                      mission.status.slice(1)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No missions found
              </p>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
          <div className="space-y-4">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium">
                      {application.volunteer.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Applied to {application.mission.title}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      application.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : application.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No applications found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

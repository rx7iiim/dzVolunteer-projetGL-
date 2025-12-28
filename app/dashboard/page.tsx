"use client"

import { useState } from "react"
import { MissionCard } from "@/components/mission-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Award, TrendingUp } from "lucide-react"

export default function DashboardOverview() {
  const [applications] = useState([
    {
      id: "1",
      missionTitle: "Youth Mentorship Program",
      organization: "Future Leaders NGO",
      status: "accepted",
      hoursCompleted: 15,
      hoursRequired: 20,
    },
    {
      id: "2",
      missionTitle: "Environmental Clean-up Initiative",
      organization: "Green Tomorrow",
      status: "pending",
      hoursCompleted: 0,
      hoursRequired: 15,
    },
  ])

  const [stats] = useState({
    totalHours: 45,
    missionsCompleted: 2,
    skillsVerified: 4,
    streak: 12,
  })

  const [upcomingMissions] = useState([
    {
      id: "1",
      title: "Youth Mentorship Program",
      organization: "Future Leaders NGO",
      location: "Algiers, Algeria",
      date: "Jan 15 - Feb 28, 2025",
      hoursRequired: 20,
      primarySDG: 4,
      skillsRequired: ["Community Engagement", "Public Speaking", "Mentoring"],
      description: "Help mentor young students",
    },
    {
      id: "2",
      title: "Environmental Clean-up Initiative",
      organization: "Green Tomorrow",
      location: "Constantine, Algeria",
      date: "Feb 1 - Feb 15, 2025",
      hoursRequired: 15,
      primarySDG: 13,
      skillsRequired: ["Teamwork", "Physical Stamina"],
      description: "Join us in cleaning up",
    },
  ])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-lg text-muted-foreground">Here's your volunteer dashboard overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalHours}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missions Completed</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.missionsCompleted}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skills Verified</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.skillsVerified}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.streak}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Applications Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Active Applications</CardTitle>
          <CardDescription>Your ongoing volunteer missions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{app.missionTitle}</h4>
                  <p className="text-sm text-muted-foreground">{app.organization}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-border rounded-full h-2 w-24">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(app.hoursCompleted / app.hoursRequired) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {app.hoursCompleted}/{app.hoursRequired}h
                    </span>
                  </div>
                </div>
                <Badge variant={app.status === "accepted" ? "default" : "secondary"} className="ml-4">
                  {app.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Opportunities */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Featured Opportunities</CardTitle>
          <CardDescription>Missions that match your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {upcomingMissions.map((mission) => (
              <MissionCard key={mission.id} {...mission} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

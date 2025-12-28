"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"

interface Application {
  id: string
  missionTitle: string
  organization: string
  status: "accepted" | "pending" | "rejected"
  appliedDate: string
  hoursCompleted: number
  hoursRequired: number
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      missionTitle: "Youth Mentorship Program",
      organization: "Future Leaders NGO",
      status: "accepted",
      appliedDate: "Jan 10, 2025",
      hoursCompleted: 15,
      hoursRequired: 20,
    },
    {
      id: "2",
      missionTitle: "Environmental Clean-up Initiative",
      organization: "Green Tomorrow",
      status: "pending",
      appliedDate: "Jan 18, 2025",
      hoursCompleted: 0,
      hoursRequired: 15,
    },
    {
      id: "3",
      missionTitle: "Digital Literacy Workshop",
      organization: "Tech for All",
      status: "rejected",
      appliedDate: "Jan 15, 2025",
      hoursCompleted: 0,
      hoursRequired: 30,
    },
  ])

  const [loggingHours, setLoggingHours] = useState<string | null>(null)
  const [hoursInput, setHoursInput] = useState("")

  const handleLogHours = (appId: string) => {
    const hours = Number.parseInt(hoursInput)
    if (hours > 0) {
      setApplications(
        applications.map((app) =>
          app.id === appId ? { ...app, hoursCompleted: Math.min(app.hoursCompleted + hours, app.hoursRequired) } : app,
        ),
      )
      setLoggingHours(null)
      setHoursInput("")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-primary text-primary-foreground">Accepted</Badge>
      case "pending":
        return <Badge className="bg-accent text-accent-foreground">Pending</Badge>
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-primary" />
      case "pending":
        return <Clock className="h-5 w-5 text-accent" />
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">My Applications</h1>
        <p className="text-lg text-muted-foreground">Track your volunteer mission applications and progress</p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Dialog
            key={app.id}
            open={loggingHours === app.id}
            onOpenChange={(open) => setLoggingHours(open ? app.id : null)}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(app.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">{app.missionTitle}</h3>
                      <p className="text-sm text-muted-foreground">{app.organization}</p>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Applied</p>
                    <p className="font-medium text-foreground">{app.appliedDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Hours Completed</p>
                    <p className="font-medium text-foreground">
                      {app.hoursCompleted}/{app.hoursRequired}h
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium text-foreground capitalize">{app.status}</p>
                  </div>
                </div>

                {app.status === "accepted" && (
                  <div className="w-full bg-border rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(app.hoursCompleted / app.hoursRequired) * 100}%` }}
                    ></div>
                  </div>
                )}

                <DialogTrigger asChild>
                  <Button
                    variant={app.status === "accepted" ? "outline" : "default"}
                    className={`w-full ${app.status === "accepted" ? "" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                  >
                    {app.status === "accepted" ? "Log Hours" : "View Details"}
                  </Button>
                </DialogTrigger>

                {/* Log Hours Dialog */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Hours for {app.missionTitle}</DialogTitle>
                    <DialogDescription>
                      You have completed {app.hoursCompleted} out of {app.hoursRequired} hours
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Hours Completed</label>
                      <input
                        type="number"
                        min="0"
                        max={app.hoursRequired - app.hoursCompleted}
                        value={hoursInput}
                        onChange={(e) => setHoursInput(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter hours"
                      />
                    </div>

                    <Button
                      onClick={() => handleLogHours(app.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Log Hours
                    </Button>
                  </div>
                </DialogContent>
              </CardContent>
            </Card>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

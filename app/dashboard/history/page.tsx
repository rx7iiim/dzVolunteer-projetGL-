"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Award } from "lucide-react"

interface HistoryEntry {
  id: string
  title: string
  organization: string
  hoursCompleted: number
  completedDate: string
  sdgImpact: number
  skillsGained: string[]
  description: string
}

export default function HistoryPage() {
  const [history] = useState<HistoryEntry[]>([
    {
      id: "1",
      title: "Community Education Workshop",
      organization: "Learning for All",
      hoursCompleted: 16,
      completedDate: "Dec 2024",
      sdgImpact: 4,
      skillsGained: ["Teaching", "Communication", "Patience"],
      description: "Taught basic computer skills to underserved communities in Algiers.",
    },
    {
      id: "2",
      title: "Environmental Cleanup Drive",
      organization: "Green Algiers",
      hoursCompleted: 12,
      completedDate: "Nov 2024",
      sdgImpact: 13,
      skillsGained: ["Teamwork", "Physical Stamina", "Leadership"],
      description: "Organized and led a community cleanup initiative at local beaches.",
    },
    {
      id: "3",
      title: "Youth Mentorship",
      organization: "Future Leaders",
      hoursCompleted: 24,
      completedDate: "Oct 2024",
      sdgImpact: 4,
      skillsGained: ["Mentoring", "Public Speaking", "Empathy"],
      description: "Mentored 5 high school students in career planning and personal development.",
    },
    {
      id: "4",
      title: "Healthcare Outreach",
      organization: "Medical Aid International",
      hoursCompleted: 20,
      completedDate: "Sep 2024",
      sdgImpact: 3,
      skillsGained: ["Healthcare Basics", "Compassion", "Organization"],
      description: "Assisted in organizing health checkup camps for underserved populations.",
    },
    {
      id: "5",
      title: "Digital Literacy Initiative",
      organization: "Tech for All",
      hoursCompleted: 18,
      completedDate: "Aug 2024",
      sdgImpact: 4,
      skillsGained: ["Tech Skills", "Patience", "Documentation"],
      description: "Helped set up and maintain computer labs for digital training.",
    },
  ])

  const totalHours = history.reduce((sum, h) => sum + h.hoursCompleted, 0)
  const uniqueOrganizations = new Set(history.map((h) => h.organization)).size
  const skillsCount = new Set(history.flatMap((h) => h.skillsGained)).size

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Volunteer History</h1>
        <p className="text-lg text-muted-foreground">Your volunteer journey and accomplishments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalHours}</p>
              </div>
              <Award className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-3xl font-bold text-foreground mt-1">{uniqueOrganizations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-secondary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skills Gained</p>
                <p className="text-3xl font-bold text-foreground mt-1">{skillsCount}</p>
              </div>
              <Award className="h-8 w-8 text-accent opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {history.map((entry) => (
          <Card key={entry.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="w-1 h-12 bg-border my-2"></div>
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground">{entry.organization}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {entry.completedDate}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground mt-3">{entry.description}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {entry.hoursCompleted} hours
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        SDG {entry.sdgImpact}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.skillsGained.map((skill) => (
                      <Badge key={skill} className="text-xs bg-primary/10 text-primary border-0 hover:bg-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

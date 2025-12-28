"use client"

import { useState } from "react"
import { MissionCard } from "@/components/mission-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function BrowseMissionsPage() {
  const [missions] = useState([
    {
      id: "1",
      title: "Youth Mentorship Program",
      organization: "Future Leaders NGO",
      location: "Algiers, Algeria",
      date: "Jan 15 - Feb 28, 2025",
      hoursRequired: 20,
      primarySDG: 4,
      skillsRequired: ["Community Engagement", "Public Speaking", "Mentoring"],
      description: "Help mentor young students and guide them towards career development.",
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
      description: "Join us in cleaning up local parks and beaches.",
    },
    {
      id: "3",
      title: "Digital Literacy Workshop",
      organization: "Tech for All",
      location: "Oran, Algeria",
      date: "Jan 20 - Mar 20, 2025",
      hoursRequired: 30,
      primarySDG: 4,
      skillsRequired: ["Teaching", "Communication", "Tech Skills"],
      description: "Teach digital skills to underserved communities.",
    },
  ])

  const [appliedMissions, setAppliedMissions] = useState<string[]>([])
  const [selectedMission, setSelectedMission] = useState<(typeof missions)[0] | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  const handleApplyMission = (missionId: string) => {
    if (!appliedMissions.includes(missionId)) {
      setAppliedMissions([...appliedMissions, missionId])
      setOpenDialog(false)
    }
  }

  const handleViewMission = (mission: (typeof missions)[0]) => {
    setSelectedMission(mission)
    setOpenDialog(true)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Browse Missions</h1>
        <p className="text-lg text-muted-foreground">
          Find volunteer opportunities that match your skills and interests
        </p>
      </div>

      <div className="grid gap-6">
        {missions.map((mission) => (
          <Dialog key={mission.id} open={openDialog && selectedMission?.id === mission.id} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <div onClick={() => handleViewMission(mission)} className="cursor-pointer">
                <MissionCard {...mission} />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedMission?.title}</DialogTitle>
                <DialogDescription className="text-lg text-foreground">
                  {selectedMission?.organization}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-muted-foreground">Description</h3>
                    <p className="text-foreground mt-2">{selectedMission?.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-muted-foreground">Location</h3>
                      <p className="text-foreground">{selectedMission?.location}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-muted-foreground">Duration</h3>
                      <p className="text-foreground">{selectedMission?.date}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-muted-foreground">Hours Required</h3>
                      <p className="text-foreground">{selectedMission?.hoursRequired} hours</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-muted-foreground">Skills Needed</h3>
                      <p className="text-foreground">{selectedMission?.skillsRequired.join(", ")}</p>
                    </div>
                  </div>
                </div>

                {appliedMissions.includes(selectedMission?.id || "") ? (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-primary">Application Submitted</p>
                        <p className="text-sm text-muted-foreground">The organization will review your application</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    onClick={() => handleApplyMission(selectedMission?.id || "")}
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
    </div>
  )
}

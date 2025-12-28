"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, Upload } from "lucide-react"

interface Skill {
  name: string
  verified: boolean
}

export default function ProfilePage() {
  const [skills, setSkills] = useState<Skill[]>([
    { name: "Community Engagement", verified: true },
    { name: "Public Speaking", verified: true },
    { name: "Project Management", verified: false },
    { name: "Teamwork", verified: true },
    { name: "Teaching", verified: false },
    { name: "Tech Skills", verified: true },
  ])

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    bio: "Passionate about making a difference in the community",
    joinDate: "3 months ago",
  })

  const [editingProfile, setEditingProfile] = useState(false)
  const [editFormData, setEditFormData] = useState(profile)
  const [verifyingSkill, setVerifyingSkill] = useState<string | null>(null)

  const handleSaveProfile = () => {
    setProfile(editFormData)
    setEditingProfile(false)
  }

  const handleVerifySkill = (skillName: string) => {
    setSkills(skills.map((skill) => (skill.name === skillName ? { ...skill, verified: true } : skill)))
    setVerifyingSkill(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Profile & Skills</h1>
        <p className="text-lg text-muted-foreground">Manage your volunteer profile and verify your skills</p>
      </div>

      {/* Profile Card */}
      <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Profile</CardTitle>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-md">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{profile.name}</p>
                <p className="text-muted-foreground">{profile.email}</p>
                <p className="text-sm text-muted-foreground mt-2">Joined {profile.joinDate}</p>
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-foreground">{profile.bio}</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skills Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Your Skills</CardTitle>
          <CardDescription>Verified skills unlock more opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <Dialog
                key={skill.name}
                open={verifyingSkill === skill.name}
                onOpenChange={(open) => setVerifyingSkill(open ? skill.name : null)}
              >
                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors bg-muted/30">
                  <span className="font-medium text-foreground">{skill.name}</span>
                  {skill.verified ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-0 text-xs">
                        Verify
                      </Button>
                    </DialogTrigger>
                  )}
                </div>

                {/* Verify Skill Dialog */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Verify {skill.name}</DialogTitle>
                    <DialogDescription>Upload a certificate or provide proof of your skill</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">Upload Certificate</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG</p>
                    </div>

                    <Button
                      onClick={() => handleVerifySkill(skill.name)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Submit for Verification
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Add New Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Skill</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <input
                  type="text"
                  placeholder="Skill name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Add Skill</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

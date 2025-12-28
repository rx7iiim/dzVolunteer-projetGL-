"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bell, Shield, Eye, AlertCircle } from "lucide-react"

interface SettingsState {
  emailNotifications: boolean
  missionAlerts: boolean
  weeklyDigest: boolean
  profileVisibility: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    missionAlerts: true,
    weeklyDigest: false,
    profileVisibility: "public",
  })

  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)

  const handleToggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSelectChange = (key: keyof SettingsState, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Notification Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
          <CardDescription>Control how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "emailNotifications", label: "Email Notifications" },
            { key: "missionAlerts", label: "Mission Alerts" },
            { key: "weeklyDigest", label: "Weekly Digest" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">{item.label}</label>
              <button
                onClick={() => handleToggle(item.key as keyof SettingsState)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[item.key as keyof SettingsState] ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[item.key as keyof SettingsState] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Manage your profile visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="visibility" className="text-sm font-medium text-foreground">
              Profile Visibility
            </label>
            <select
              id="visibility"
              value={settings.profileVisibility}
              onChange={(e) => handleSelectChange("profileVisibility", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="public">Public - Anyone can see your profile</option>
              <option value="private">Private - Only organizations can see your profile</option>
              <option value="hidden">Hidden - Nobody can see your profile</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Update your security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Current Password</label>
                  <input
                    type="password"
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <input
                    type="password"
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button
                  onClick={() => setChangePasswordOpen(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Update Password
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                Two-Factor Authentication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Two-Factor Authentication</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <p className="text-sm text-foreground">Add an extra layer of security to your account</p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Enable 2FA</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive hover:bg-destructive/5 bg-transparent">
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Delete Account
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-destructive">Are you sure you want to delete your account?</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setDeleteAccountOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Delete Permanently
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

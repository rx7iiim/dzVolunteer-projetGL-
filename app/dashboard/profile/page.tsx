"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Upload,
  Search,
  Loader2,
  AlertCircle,
  Camera,
  User,
} from "lucide-react";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth"; // Ensure this path matches your file structure
import { useFiles } from "./api";

export default function ProfilePage() {
  const fetchWithAuth = useFetchWithAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    avatar: null as File | null, // Store file object for upload
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [skills, setSkills] = useState<VolunteerSkill[]>([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SystemSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [proficiencyLevel, setProficiencyLevel] = useState("intermediate");
  const [isSearching, setIsSearching] = useState(false);

  const [verifyingSkillId, setVerifyingSkillId] = useState<string | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    fetchProfile,
    handleAddSkill,
    handleAvatarChange,
    handleSaveProfile,
    searchSystemSkills,
    handleVerifySkill,
    fetchSkills,
  } = useFiles();

  useEffect(() => {
    fetchProfile();
    fetchSkills();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (skillSearchQuery) {
        searchSystemSkills(skillSearchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [skillSearchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync edit form when profile loads or dialog opens
  useEffect(() => {
    if (profile && editingProfile) {
      setEditFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number || "",
        avatar: null,
      });
      setAvatarPreview(profile.avatar);
    }
  }, [profile, editingProfile]);
  // --- Render Helpers ---

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Profile & Skills</h1>
        <p className="text-lg text-muted-foreground">
          Manage your volunteer profile and verify your skills
        </p>
      </div>

      {/* --- Profile Card --- */}
      <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Your Profile</CardTitle>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-4">
              {/* Avatar Display */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-2 border-primary/20 bg-muted flex items-center justify-center overflow-hidden shadow-md">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                      {profile?.first_name?.charAt(0) || <User />}
                    </div>
                  )}
                </div>
                {profile?.is_verified && (
                  <div
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm"
                    title="Account Verified"
                  >
                    <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-50" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile?.full_name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                    {profile?.user_type}
                  </span>
                </div>
                <p className="text-muted-foreground">{profile?.email}</p>
                {profile?.phone_number && (
                  <p className="text-muted-foreground text-sm">
                    {profile.phone_number}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-muted-foreground">
                  <span>Joined: {formatDate(profile?.date_joined || "")}</span>
                  <span>•</span>
                  <span>
                    Rating: {profile?.average_rating} ({profile?.rating_count}{" "}
                    reviews)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Edit Profile Dialog --- */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/50 hover:border-primary transition-colors">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Click to change avatar
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  First Name
                </label>
                <input
                  type="text"
                  value={editFormData.first_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      first_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editFormData.last_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      last_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <input
                type="tel"
                value={editFormData.phone_number}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    phone_number: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+1234567890"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              className="w-full mt-2"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Skills Card --- */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Your Skills</CardTitle>
          <CardDescription>
            Verified skills unlock more opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSkillsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((item) => (
                <Dialog
                  key={item.id}
                  open={verifyingSkillId === item.id}
                  onOpenChange={(open) => {
                    if (!open) setVerifyingSkillId(null);
                  }}
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div>
                      <span className="font-medium text-foreground block">
                        {item.skill.name}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.proficiency_level_display}
                      </span>
                    </div>

                    {item.verification_status === "verified" ? (
                      <div className="flex items-center text-primary text-sm font-medium">
                        <CheckCircle className="h-5 w-5 mr-1" /> Verified
                      </div>
                    ) : item.verification_status === "pending" ? (
                      <span className="text-yellow-600 text-sm font-medium">
                        Pending Review
                      </span>
                    ) : (
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs hover:text-primary hover:bg-primary/10"
                          onClick={() => setVerifyingSkillId(item.id)}
                        >
                          Verify Now
                        </Button>
                      </DialogTrigger>
                    )}
                  </div>

                  {/* Verify Skill Dialog */}
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Verify {item.skill.name}</DialogTitle>
                      <DialogDescription>
                        Upload proof for:{" "}
                        {item.skill.verification_requirement_display ||
                          "General Skill"}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors relative">
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) =>
                            setVerificationFile(e.target.files?.[0] || null)
                          }
                          accept=".pdf,.jpg,.png,.jpeg"
                        />
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          {verificationFile
                            ? verificationFile.name
                            : "Click to Upload Certificate"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, JPG, or PNG
                        </p>
                      </div>

                      <Button
                        onClick={handleVerifySkill}
                        disabled={!verificationFile || isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {isUploading
                          ? "Uploading..."
                          : "Submit for Verification"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}

          {/* --- Add New Skill Dialog --- */}
          <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-4 bg-transparent border-dashed text-muted-foreground hover:text-foreground"
              >
                + Add New Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Skill</DialogTitle>
                <DialogDescription>
                  Search for a skill to add to your profile.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search skills (e.g., Python, First Aid)..."
                    value={skillSearchQuery}
                    onChange={(e) => {
                      setSkillSearchQuery(e.target.value);
                      setSelectedSkillId(null);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && !selectedSkillId && (
                  <div className="max-h-40 overflow-y-auto border rounded-md divide-y bg-popover">
                    {searchResults.map((skill) => (
                      <div
                        key={skill.id}
                        onClick={() => {
                          setSkillSearchQuery(skill.name);
                          setSelectedSkillId(skill.id);
                          setSearchResults([]);
                        }}
                        className="p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm transition-colors"
                      >
                        <span className="font-medium">{skill.name}</span>
                        {skill.category && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({skill.category.name})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Fallback if no results */}
                {skillSearchQuery &&
                  searchResults.length === 0 &&
                  !isSearching &&
                  !selectedSkillId && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <AlertCircle className="h-4 w-4" /> No skills found.
                    </div>
                  )}

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Proficiency Level
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    value={proficiencyLevel}
                    onChange={(e) => setProficiencyLevel(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <Button
                  onClick={handleAddSkill}
                  disabled={!selectedSkillId}
                  className="w-full"
                >
                  Add Skill
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

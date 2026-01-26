"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Building2,
  LogOut,
  Edit,
  Star,
  Loader2,
  Trash2,
  Save,
  Lock,
  KeyRound,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// --- Interfaces ---
interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  user_type: string;
  user_type_display: string;
  is_verified: boolean;
  has_organization_profile: boolean;
  date_joined: string;
  average_rating: number;
  rating_count: number;
  profile_picture_url: string | null;
}

interface OrgProfileData {
  name: string;
  description: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [apiLoading, setApiLoading] = useState(false);

  // --- State ---
  const [user, setUser] = useState<UserData | null>(null);
  const [orgProfile, setOrgProfile] = useState<OrgProfileData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modals
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isOrgEditOpen, setIsOrgEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Forms
  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [orgForm, setOrgForm] = useState({ name: "", description: "" });

  // --- 1. Load Data ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Get access token
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No access token found");
        }

        // A. Fetch Current User (Fresh Data)
        const userResponse = await fetch(`${APIURL}/api/accounts/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData && userData.user) {
            setUser(userData.user);
            // Update local storage to keep it in sync
            localStorage.setItem("user", JSON.stringify(userData.user));

            // Pre-fill user form
            setUserForm({
              first_name: userData.user.first_name || "",
              last_name: userData.user.last_name || "",
              phone_number: userData.user.phone_number || "",
            });

            // B. Fetch Organization Profile if exists
            if (userData.user.has_organization_profile) {
              const orgResponse = await fetch(
                `${APIURL}/api/accounts/organization-profile/`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (orgResponse.ok) {
                const orgData = await orgResponse.json();
                setOrgProfile(orgData);
                setOrgForm({
                  name: orgData.name || "",
                  description: orgData.description || "",
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- 2. Actions ---

  // Update User Profile
  const handleUserUpdate = async () => {
    try {
      setApiLoading(true);

      // Get access token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${APIURL}/api/accounts/me/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userForm),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || response.statusText || "Request failed");
      }

      const res = await response.json();
      if (res && res.user) {
        setUser(res.user); // Update UI
        localStorage.setItem("user", JSON.stringify(res.user)); // Sync Storage
        setIsUserEditOpen(false);
      }
    } catch (err) {
      console.error("User update failed", err);
    } finally {
      setApiLoading(false);
    }
  };

  // Change Password
  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      alert("New passwords do not match.");
      return;
    }

    try {
      setApiLoading(true);

      // Get access token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${APIURL}/api/accounts/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || response.statusText || "Request failed");
      }

      alert("Password changed successfully.");
      setIsPasswordOpen(false);
      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password_confirm: "",
      });
    } catch (err) {
      console.error("Password change failed", err);
    } finally {
      setApiLoading(false);
    }
  };

  // Update Org Profile
  const handleOrgUpdate = async () => {
    try {
      setApiLoading(true);

      // Get access token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/accounts/organization-profile/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orgForm),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || response.statusText || "Request failed");
      }

      const res = await response.json();
      setOrgProfile(res.profile);
      setIsOrgEditOpen(false);
    } catch (err) {
      console.error("Org update failed", err);
    } finally {
      setApiLoading(false);
    }
  };

  // Delete Org Profile
  const handleDeleteOrg = async () => {
    try {
      setApiLoading(true);

      // Get access token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${APIURL}/api/accounts/organization-profile/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || response.statusText || "Request failed");
      }

      if (user) {
        const updatedUser = { ...user, has_organization_profile: false };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      setOrgProfile(null);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setApiLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/signin");
  };

  // Helpers
  const getInitials = (name: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "??";
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (initialLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (!user) return <div className="p-8 text-center">No profile found.</div>;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your personal details and organization profile.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPasswordOpen(true)}>
            <Lock className="mr-2 h-4 w-4" /> Change Password
          </Button>
          <Button onClick={() => setIsUserEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Personal Info
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity Card */}
        <Card className="lg:col-span-1 h-fit border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md mb-4 text-2xl font-bold text-slate-500 overflow-hidden">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user.full_name)
              )}
            </div>
            <CardTitle className="text-xl capitalize">
              {user.full_name}
            </CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              <Badge variant="secondary">{user.user_type_display}</Badge>
              {user.is_verified && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                  Verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star
                className={`h-5 w-5 ${user.average_rating > 0 ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
              />
              <span className="font-bold text-lg">
                {user.average_rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-sm">
                ({user.rating_count} reviews)
              </span>
            </div>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" /> {user.email}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />{" "}
                {user.phone_number || "No phone added"}
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Joined{" "}
                {formatDate(user.date_joined)}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </CardFooter>
        </Card>

        {/* Right: Organization & Danger Zone */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Organization
                  Details
                </CardTitle>
                <CardDescription>
                  Public information about your NGO.
                </CardDescription>
              </div>
              {user.has_organization_profile && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsOrgEditOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              )}
            </CardHeader>

            <CardContent>
              {user.has_organization_profile ? (
                orgProfile ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase mb-1">
                        Organization Name
                      </h4>
                      <p className="text-lg font-medium">{orgProfile.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase mb-1">
                        Description
                      </h4>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {orgProfile.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )
              ) : (
                <div className="bg-slate-50 border border-dashed rounded-lg p-8 text-center">
                  <Building2 className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-muted-foreground">
                    You have not set up an organization profile yet.
                  </p>
                  <Button className="mt-4" variant="outline">
                    Create Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {user.has_organization_profile && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive text-base">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Permanently delete your organization profile.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- Modals --- */}

      {/* 1. Edit User Info Modal */}
      <Dialog open={isUserEditOpen} onOpenChange={setIsUserEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Personal Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={userForm.first_name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={userForm.last_name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={userForm.phone_number}
                onChange={(e) =>
                  setUserForm({ ...userForm, phone_number: e.target.value })
                }
                placeholder="055..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUserUpdate} disabled={apiLoading}>
              {apiLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Change Password Modal */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    old_password: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.new_password_confirm}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password_confirm: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={apiLoading}>
              {apiLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Edit Org Modal */}
      <Dialog open={isOrgEditOpen} onOpenChange={setIsOrgEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                value={orgForm.name}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={orgForm.description}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrgEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOrgUpdate} disabled={apiLoading}>
              {apiLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Delete Org Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your organization profile. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrg}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

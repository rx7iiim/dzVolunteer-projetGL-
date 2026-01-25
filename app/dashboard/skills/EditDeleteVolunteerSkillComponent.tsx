"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  Loader2,
  AlertTriangle,
  Calendar,
  Link as LinkIcon,
  Star,
  Upload,
  X,
  FileText,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface EditDeleteVolunteerSkillComponentProps {
  skillId: string;
  onSuccess: () => void; // Callback to refresh list after update/delete
}

export default function EditDeleteVolunteerSkillComponent({
  skillId,
  onSuccess,
}: EditDeleteVolunteerSkillComponentProps) {
  // --- State ---
  const [skill, setSkill] = useState<any>(null);
  const [formData, setFormData] = useState({
    proficiency_level: "intermediate",
    last_used_date: "",
    supporting_url: "",
    is_primary: false,
  });
  const [newFile, setNewFile] = useState<File | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

  const [isLoadingSkill, setIsLoadingSkill] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Skill Data ---
  useEffect(() => {
    if (skillId) {
      fetchSkill();
    }
  }, [skillId]);

  const fetchSkill = async () => {
    setIsLoadingSkill(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${APIURL}/api/volunteer-skills/${skillId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch skill details");
      }

      const skillData = await response.json();
      setSkill(skillData);

      // Populate form
      setFormData({
        proficiency_level: skillData.proficiency_level || "intermediate",
        last_used_date: skillData.last_used_date || "",
        supporting_url: skillData.supporting_url || "",
        is_primary: skillData.is_primary || false,
      });
      setCurrentFileUrl(skillData.supporting_document || null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoadingSkill(false);
    }
  };

  // --- Handle Update (PATCH) ---
  const handleUpdate = async () => {
    if (!skill) return;
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const data = new FormData();

      data.append("proficiency_level", formData.proficiency_level);

      if (formData.last_used_date) {
        data.append("last_used_date", formData.last_used_date);
      }

      if (formData.supporting_url) {
        data.append("supporting_url", formData.supporting_url);
      } else {
        data.append("supporting_url", "");
      }

      data.append("is_primary", formData.is_primary ? "true" : "false");

      if (newFile) {
        data.append("supporting_document", newFile);
      }

      const response = await fetch(`${APIURL}/api/volunteer-skills/${skill.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 403)
          throw new Error("You can only update your own skills.");
        if (response.status === 400)
          throw new Error(errData.detail || "Invalid data provided.");
        throw new Error("Failed to update skill.");
      }

      onSuccess(); // This will refresh and close modal
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handle Delete (DELETE) ---
  const handleDelete = async () => {
    if (!skill) return;
    setIsDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${APIURL}/api/volunteer-skills/${skill.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403)
          throw new Error("You can only remove your own skills.");
        throw new Error("Failed to delete skill.");
      }

      const data = await response.json();

      if (data.deleted) {
        onSuccess(); // This will refresh and close modal
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state while fetching skill
  if (isLoadingSkill) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">
          Loading skill details...
        </p>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-sm text-destructive">Failed to load skill details</p>
      </div>
    );
  }

  return (
    <>
      {!deleteConfirmOpen ? (
        /* --- EDIT MODE --- */
        <>
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>
              Update details for{" "}
              <strong>{skill.skill?.name || "this skill"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Proficiency & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <Select
                  value={formData.proficiency_level}
                  onValueChange={(val) =>
                    setFormData({ ...formData, proficiency_level: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Last Used Date</Label>
                <Input
                  type="date"
                  value={formData.last_used_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      last_used_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Supporting URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LinkIcon className="h-3 w-3" /> Project / Portfolio URL
              </Label>
              <Input
                placeholder="https://..."
                value={formData.supporting_url}
                onChange={(e) =>
                  setFormData({ ...formData, supporting_url: e.target.value })
                }
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-3 w-3" /> Supporting Document
              </Label>

              {currentFileUrl && !newFile ? (
                <div className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    Current: Document Uploaded
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setCurrentFileUrl(null)}
                  >
                    Replace
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.png"
                    className="text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {newFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Primary Toggle */}
            <div className="flex items-center space-x-2 border-t pt-4">
              <Checkbox
                id="edit-primary"
                checked={formData.is_primary}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, is_primary: !!c })
                }
              />
              <Label
                htmlFor="edit-primary"
                className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
              >
                Mark as Primary Skill
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              </Label>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 dark:border-red-900/50 rounded-lg p-4 bg-red-50 dark:bg-red-950/20 mt-6">
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                Danger Zone
              </h4>
              <div className="flex items-center justify-between">
                <p className="text-xs text-red-600/80 dark:text-red-400/70">
                  Remove this skill from your profile permanently.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Skill
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </>
      ) : (
        /* --- DELETE CONFIRMATION MODE --- */
        <>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{skill.skill?.name}</strong> from your profile?
              <br />
              <br />
              This action cannot be undone and you will lose any verification
              status associated with this skill.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md my-4">
              {error}
            </div>
          )}

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Yes, Delete Skill
            </Button>
          </DialogFooter>
        </>
      )}
    </>
  );
}

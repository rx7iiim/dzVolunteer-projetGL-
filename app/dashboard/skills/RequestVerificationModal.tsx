"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Upload,
  Link as LinkIcon,
  Plus,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface RequestVerificationModalProps {
  skillId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function RequestVerificationModal({
  skillId,
  onSuccess,
  onClose,
}: RequestVerificationModalProps) {
  // --- State ---
  const [skill, setSkill] = useState<any>(null);
  const [isLoadingSkill, setIsLoadingSkill] = useState(true);

  // --- Form State ---
  const [links, setLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- UI State ---
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      // Reset form
      setLinks([]);
      setCurrentLink("");
      setNotes("");
      setSelectedFile(null);
      setStep("form");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoadingSkill(false);
    }
  };

  // --- Helper Functions ---
  const handleAddLink = () => {
    if (!currentLink) return;
    if (!currentLink.startsWith("http")) {
      setError("Link must start with http:// or https://");
      return;
    }
    setLinks([...links, currentLink]);
    setCurrentLink("");
    setError(null);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // --- Submit Logic ---
  const handleSubmit = async () => {
    if (!skill) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();

      if (notes.trim()) {
        formData.append("notes", notes);
      }

      if (selectedFile) {
        formData.append("documents", selectedFile);
      }

      links.forEach((link) => {
        formData.append("links", link);
      });

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/${skill.id}/request_verification/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          throw new Error(data.detail || "Invalid request data.");
        }
        if (response.status === 403) {
          throw new Error(
            "You are not allowed to request verification for this skill.",
          );
        }
        throw new Error("Failed to submit verification request.");
      }

      setStep("success");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onSuccess(); // This will refresh the parent and close the modal
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
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-sm text-destructive">Failed to load skill details</p>
      </div>
    );
  }

  return (
    <>
      {step === "form" ? (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Request Verification
            </DialogTitle>
            <DialogDescription>
              Submit evidence to get <strong>{skill?.skill?.name}</strong>{" "}
              verified by an administrator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Supporting Document (Certificate/PDF)</Label>
              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 border-muted-foreground/25 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    accept=".pdf,.jpg,.png,.jpeg"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 dark:text-green-400 truncate">
                      {selectedFile.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-green-700 hover:text-red-600"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Label>External Links (Portfolios, Git, etc.)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://..."
                    className="pl-9"
                    value={currentLink}
                    onChange={(e) => setCurrentLink(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddLink())
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddLink}
                  disabled={!currentLink}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* List of Added Links */}
              {links.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {links.map((link, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded-md border"
                    >
                      <span className="truncate max-w-[350px] text-muted-foreground">
                        {link}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveLink(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Describe your experience or explain the attached evidence..."
                className="resize-none h-24"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/1000
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || (!selectedFile && links.length === 0 && !notes)
              }
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Request
            </Button>
          </DialogFooter>
        </>
      ) : (
        /* --- SUCCESS STATE --- */
        <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in-95">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl mb-2">Request Submitted!</DialogTitle>
          <DialogDescription className="max-w-[300px] mx-auto mb-6">
            Your verification request for <strong>{skill?.skill?.name}</strong>{" "}
            has been sent to the admin team.
          </DialogDescription>

          <div className="bg-muted p-4 rounded-md w-full mb-6 text-left">
            <h4 className="text-sm font-semibold mb-2">Summary Sent:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• {selectedFile ? "1 Document attached" : "No documents"}</p>
              <p>• {links.length} Link(s) provided</p>
              <p>• Notes: {notes ? "Included" : "None"}</p>
            </div>
          </div>

          <Button onClick={handleComplete} className="w-full">
            Done
          </Button>
        </div>
      )}
    </>
  );
}

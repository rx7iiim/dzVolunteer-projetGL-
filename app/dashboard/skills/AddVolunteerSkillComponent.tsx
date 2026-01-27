"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  Circle,
  X,
  Link as LinkIcon,
  Star,
  ShieldAlert,
  FileText,
  Search,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

const APIURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AddVolunteerSkillComponentProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function AddVolunteerSkillComponent({
  onSuccess,
  onClose,
}: AddVolunteerSkillComponentProps) {
  const [step, setStep] = useState<"form" | "success">("form");

  // --- Data State ---
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // --- Form State ---
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const [proficiency, setProficiency] = useState("intermediate");
  const [yearsOfExperience, setYearsOfExperience] = useState("1");
  const [notes, setNotes] = useState("");
  const [lastUsedDate, setLastUsedDate] = useState("");
  const [supportingUrl, setSupportingUrl] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Submission State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Fetch System Skills ---
  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoadingSkills(true);
      setError(null);

      try {
        const token = localStorage.getItem("accessToken");
        // Note: Even if not logged in, we might want to fetch public skills,
        // but sticking to your logic of checking token:
        if (!token) {
          setError("You must be logged in to load available skills.");
          setAllSkills([]);
          return;
        }

        const res = await fetch(`${APIURL}/api/skills/skills/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load skills catalog");

        const data = await res.json();
        setAllSkills(data.results || data);
      } catch (err) {
        console.error("Fetch skills failed", err);
        setAllSkills([]);
        setError("Failed to load skills list. Please try again later.");
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  const filteredSkills = allSkills.filter((skill) =>
    skill.name.toLowerCase().includes(filterQuery.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!selectedSkillId) {
      setError("Please select a skill from the list.");
      return;
    }

    if (!yearsOfExperience || parseInt(yearsOfExperience) < 0) {
      setError("Please enter valid years of experience.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to add a skill. Please sign in again.");
        setIsSubmitting(false);
        return;
      }

      // Build payload matching API requirements
      const payload = {
        skill_id: selectedSkillId,
        years_of_experience: parseInt(yearsOfExperience) || 1,
        proficiency_level: proficiency,
        notes: notes.trim() || undefined,
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${APIURL}/api/skills/volunteer-skills/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response body:", responseText);

      // Parse response
      let responseData: Record<string, unknown> = {};
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { detail: responseText };
      }

      if (!response.ok) {
        console.error("Error response:", responseData);

        // Handle different error formats
        let errorMessage = "Failed to add skill.";

        // Check for field-specific errors (e.g., {"skill_id": ["This field is required."]})
        if (responseData.errors && typeof responseData.errors === "object") {
          const fieldErrors = Object.entries(
            responseData.errors as Record<string, string[]>,
          )
            .map(
              ([field, messages]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`,
            )
            .join("; ");
          errorMessage = fieldErrors;
        }
        // Check for direct field errors (e.g., {"skill_id": ["Invalid pk..."]})
        else if (
          typeof responseData === "object" &&
          !responseData.detail &&
          !responseData.error
        ) {
          const fieldErrors = Object.entries(responseData)
            .filter(([key]) => key !== "status" && key !== "code")
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(", ")}`;
              }
              return `${field}: ${messages}`;
            })
            .join("; ");
          if (fieldErrors) errorMessage = fieldErrors;
        }
        // Check for detail or error message
        else if (responseData.detail) {
          errorMessage = String(responseData.detail);
        } else if (responseData.error) {
          errorMessage = String(responseData.error);
        } else if (responseData.message) {
          errorMessage = String(responseData.message);
        }

        // Handle specific HTTP status codes
        switch (response.status) {
          case 400:
            errorMessage = `Invalid request: ${errorMessage}`;
            break;
          case 401:
            errorMessage = "Session expired. Please sign in again.";
            break;
          case 403:
            errorMessage = "You don't have permission to perform this action.";
            break;
          case 404:
            errorMessage = "The skill you selected no longer exists.";
            break;
          case 409:
            errorMessage = "You already have this skill in your profile.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
        }

        throw new Error(errorMessage);
      }

      console.log("Success response:", responseData);
      setResponseData(responseData);
      setStep("success");
    } catch (err: unknown) {
      console.error("Catch error:", err);

      // Handle network errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onSuccess();
    onClose();
  };

  const getSelectedSkillName = () => {
    const s = allSkills.find((item) => item.id === selectedSkillId);
    return s ? s.name : "Unknown Skill";
  };

  return (
    <>
      {/* --- STEP 1: FORM --- */}
      {step === "form" && (
        <>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Select a skill from the list below to add to your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 max-h-[70vh] overflow-y-auto">
            {/* Error Banner */}
            {error && (
              <div className="bg-destructive/15 text-destructive text-xs sm:text-sm p-2 sm:p-3 rounded-md flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {/* Skill Selection Section */}
            <div className="space-y-3">
              <Label>Select Skill *</Label>

              {/* Filter Input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter skills..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Scrollable List */}
              <div className="h-[150px] sm:h-[200px] w-full border rounded-md bg-slate-50 overflow-y-auto p-1.5 sm:p-2">
                {isLoadingSkills ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs">Loading skills...</span>
                  </div>
                ) : filteredSkills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <span className="text-sm">No skills found.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSkills.map((skill) => {
                      const isSelected = selectedSkillId === skill.id;

                      // FIX: Safely handle category rendering if it's an object
                      let categoryDisplay = "General";
                      if (skill.category_name) {
                        categoryDisplay = skill.category_name;
                      } else if (
                        typeof skill.category === "object" &&
                        skill.category !== null
                      ) {
                        categoryDisplay = skill.category.name || "General";
                      } else if (typeof skill.category === "string") {
                        categoryDisplay = skill.category;
                      }

                      return (
                        <div
                          key={skill.id}
                          onClick={() => setSelectedSkillId(skill.id)}
                          className={`
                            flex items-center justify-between p-3 rounded-md cursor-pointer border transition-all
                            ${
                              isSelected
                                ? "bg-primary/5 border-primary shadow-sm"
                                : "bg-white border-transparent hover:bg-white hover:border-slate-200"
                            }
                          `}
                        >
                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-medium ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {skill.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {categoryDisplay}
                            </span>
                          </div>

                          <div>
                            {isSelected ? (
                              <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-300" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Proficiency & Years of Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Proficiency *</Label>
                <Select value={proficiency} onValueChange={setProficiency}>
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

              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Years of Experience *</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="e.g. 2"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">Notes (Optional)</Label>
              <Input
                placeholder="e.g. I have used this skill in several previous projects."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Last Used Date */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">Last Used (Optional)</Label>
              <Input
                type="date"
                value={lastUsedDate}
                onChange={(e) => setLastUsedDate(e.target.value)}
              />
            </div>

            {/* Evidence Section */}
            <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Evidence</h4>
                <Badge variant="outline" className="text-[10px] h-5">
                  Optional
                </Badge>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <LinkIcon className="h-3 w-3 flex-shrink-0" /> Project /
                  Portfolio URL
                </Label>
                <Input
                  placeholder="https://github.com/..."
                  value={supportingUrl}
                  onChange={(e) => setSupportingUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <FileText className="h-3 w-3 flex-shrink-0" /> Certificate /
                  Document
                </Label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <label
                    htmlFor="file-upload"
                    className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                  {selectedFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Toggle */}
            <div className="flex items-center space-x-2 border-t pt-3 sm:pt-4">
              <Checkbox
                id="primary"
                checked={isPrimary}
                onCheckedChange={(c: boolean | "indeterminate") =>
                  setIsPrimary(!!c)
                }
              />
              <Label
                htmlFor="primary"
                className="text-sm font-medium leading-none flex items-center gap-2"
              >
                Mark as Primary Skill
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedSkillId || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Skill
            </Button>
          </DialogFooter>
        </>
      )}

      {/* --- STEP 2: SUCCESS --- */}
      {step === "success" && responseData && (
        <div className="py-4 sm:py-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>

          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            Skill Added Successfully!
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6 max-w-xs">
            Your skill has been added to your profile.
          </p>

          <div className="w-full bg-slate-50 border rounded-lg p-3 sm:p-4 text-left shadow-sm mb-4 sm:mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {getSelectedSkillName()}
                </h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {proficiency}
                </p>
              </div>
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

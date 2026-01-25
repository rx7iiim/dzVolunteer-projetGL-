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

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to add a skill.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("skill_id", selectedSkillId);
      formData.append("proficiency_level", proficiency);
      if (lastUsedDate) formData.append("last_used_date", lastUsedDate);
      if (supportingUrl) formData.append("supporting_url", supportingUrl);
      if (isPrimary) formData.append("is_primary", "true");
      if (selectedFile) formData.append("supporting_document", selectedFile);

      const response = await fetch(`${APIURL}/api/skills/volunteer-skills/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Failed to create skill: ${response.statusText}`,
        );
      }

      const data = await response.json();
      setResponseData(data);
      setStep("success");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
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

          <div className="space-y-6 py-4">
            {/* Error Banner */}
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                {error}
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
              <div className="h-[200px] w-full border rounded-md bg-slate-50 overflow-y-auto p-2">
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

            {/* Proficiency & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proficiency</Label>
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

              <div className="space-y-2">
                <Label>Last Used (Optional)</Label>
                <Input
                  type="date"
                  value={lastUsedDate}
                  onChange={(e) => setLastUsedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Evidence Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Evidence</h4>
                <Badge variant="outline" className="text-[10px] h-5">
                  Optional
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-3 w-3" /> Project / Portfolio URL
                </Label>
                <Input
                  placeholder="https://github.com/..."
                  value={supportingUrl}
                  onChange={(e) => setSupportingUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Certificate / Document
                </Label>
                <div className="flex items-center gap-3">
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
            <div className="flex items-center space-x-2 border-t pt-4">
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

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
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
        <div className="py-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-xl font-semibold mb-2">
            Skill Added Successfully!
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Your skill has been added to your profile.
          </p>

          <div className="w-full bg-slate-50 border rounded-lg p-4 text-left shadow-sm mb-6">
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

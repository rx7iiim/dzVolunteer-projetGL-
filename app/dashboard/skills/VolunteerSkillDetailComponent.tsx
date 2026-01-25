"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  X,
  Calendar,
  Star,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Award,
  Info,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface VolunteerSkillDetailProps {
  skillId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VolunteerSkillDetail({
  skillId,
  isOpen,
  onClose,
}: VolunteerSkillDetailProps) {
  const [skill, setSkill] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Fetching Logic (GET /api/volunteer-skills/{id}/) ---
  useEffect(() => {
    if (isOpen && skillId) {
      fetchSkillDetails(skillId);
    } else {
      // Reset state when closed
      setSkill(null);
      setError(null);
    }
  }, [isOpen, skillId]);

  const fetchSkillDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Get token from storage
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${APIURL}/api/volunteer-skills/${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("Skill not found.");
        if (response.status === 403)
          throw new Error("You do not have permission to view this skill.");
        throw new Error("Failed to load skill details.");
      }

      const data = await response.json();
      setSkill(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Render Helpers ---
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Unverified
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Fetching skill details...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Error Loading Skill
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {/* --- 3. Success / Content State --- */}
        {!isLoading && !error && skill && (
          <>
            <DialogHeader className="space-y-4 pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {skill.skill.name}
                    {skill.is_primary && (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-base">
                    <Award className="h-4 w-4" />
                    {skill.skill.category_name}
                  </DialogDescription>
                </div>
                {getStatusBadge(skill.verification_status)}
              </div>
            </DialogHeader>

            <Separator />

            <div className="space-y-6 py-4">
              {/* Section 1: Proficiency & Usage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Proficiency Level
                  </span>
                  <div className="font-semibold text-lg capitalize flex items-center gap-2">
                    {skill.proficiency_level_display}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Last Used
                  </span>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(skill.last_used_date)}
                  </div>
                </div>
              </div>

              {/* Section 2: Verification Details */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Verification Status</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block">
                      Requirement
                    </span>
                    <span className="font-medium">
                      {skill.skill.verification_requirement_display || "None"}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs block">
                      Current Status
                    </span>
                    <span className="font-medium capitalize">
                      {skill.verification_status_display}
                    </span>
                  </div>

                  {skill.verified_by_details && (
                    <div>
                      <span className="text-muted-foreground text-xs block">
                        Verified By
                      </span>
                      <span className="font-medium">
                        {skill.verified_by_details.name || "Admin"}
                      </span>
                    </div>
                  )}

                  {skill.verification_date && (
                    <div>
                      <span className="text-muted-foreground text-xs block">
                        Date Verified
                      </span>
                      <span className="font-medium">
                        {formatDate(skill.verification_date)}
                      </span>
                    </div>
                  )}

                  {skill.verification_notes && (
                    <div className="col-span-full mt-2 bg-background p-2 rounded border border-dashed">
                      <span className="text-muted-foreground text-xs block">
                        Admin Notes:
                      </span>
                      <p className="text-sm italic text-muted-foreground">
                        {skill.verification_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Evidence & Documents */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" /> Evidence & Supporting Info
                </h4>

                {/* No evidence state */}
                {!skill.supporting_url && !skill.supporting_document && (
                  <p className="text-sm text-muted-foreground italic pl-6">
                    No supporting documents or links provided.
                  </p>
                )}

                {/* Supporting URL */}
                {skill.supporting_url && (
                  <div className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-muted-foreground font-medium">
                        Project URL
                      </p>
                      <a
                        href={skill.supporting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate block"
                      >
                        {skill.supporting_url}
                      </a>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                {/* Supporting Document */}
                {skill.supporting_document && (
                  <div className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        Uploaded Document
                      </p>
                      <a
                        href={skill.supporting_document}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        View Supporting Document
                      </a>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 text-xs text-muted-foreground border-t">
                <span>Created: {formatDate(skill.created_at)}</span>
                <span>ID: {skill.id.slice(0, 8)}...</span>
              </div>
            </div>

            <DialogFooter>
              {/* Contextual actions based on status */}
              {skill.verification_status !== "verified" &&
                skill.verification_status !== "pending" && (
                  <Button className="w-full sm:w-auto" variant="default">
                    Request Verification
                  </Button>
                )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

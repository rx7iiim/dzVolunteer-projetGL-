"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  ShieldCheck,
  Clock,
  AlertCircle,
  Star,
  MoreVertical,
  CheckCircle2,
  Trophy,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the type for a volunteer skill item (as used in UI)
interface VolunteerSkill {
  id: string;
  verification_status: string;
  verification_requested: boolean;
  is_primary: boolean;
  proficiency_level_display?: string;
  verification_requirement_display?: string;
  updated_at?: string;
  skill: {
    name: string;
    category_name?: string;
  };
}

interface SkillsCardProps {
  skill: VolunteerSkill;
  onEdit: () => void;
  onRequestVerification: () => void;
  onViewHistory: () => void;
}

// --- Render Helpers ---
const getStatusIcon = (status: string, isRequested: boolean) => {
  if (status === "verified") {
    return (
      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
        <ShieldCheck className="h-5 w-5" />
      </div>
    );
  } else if (status === "pending" || isRequested) {
    return (
      <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
        <Clock className="h-5 w-5" />
      </div>
    );
  } else {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
        <AlertCircle className="h-5 w-5" />
      </div>
    );
  }
};

const getStatusBadge = (status: string, isRequested: boolean) => {
  if (status === "verified") {
    return (
      <Badge
        variant="outline"
        className="border-green-500 text-green-600 bg-green-50"
      >
        Verified
      </Badge>
    );
  } else if (status === "pending" || isRequested) {
    return (
      <Badge
        variant="outline"
        className="border-amber-500 text-amber-600 bg-amber-50"
      >
        Pending
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="outline"
        className="border-gray-500 text-gray-600 bg-gray-50"
      >
        Not Verified
      </Badge>
    );
  }
};

// Single skill card component (default export) used by Profile page
export default function SkillsCard({
  skill,
  onEdit,
  onRequestVerification,
  onViewHistory,
}: SkillsCardProps) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/50 transition-all duration-200 shadow-sm">
      {/* Left Section: Icon & Info */}
      <div className="flex items-start gap-4">
        <div className="mt-1 shrink-0">
          {getStatusIcon(
            skill.verification_status,
            skill.verification_requested,
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-semibold text-base text-foreground">
              {skill.skill.name}
            </h3>

            {/* Primary Badge */}
            {skill.is_primary && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                Primary
              </span>
            )}

            {/* Mobile Badge (hidden on desktop) */}
            <div className="sm:hidden">
              {getStatusBadge(
                skill.verification_status,
                skill.verification_requested,
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{skill.skill.category_name || "General"}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40"></span>
            <span className="font-medium text-foreground">
              {skill.proficiency_level_display}
            </span>
          </p>

          {/* Verification Requirement Hint */}
          {skill.verification_status !== "verified" && (
            <p className="text-xs text-muted-foreground/80 italic">
              Requires:{" "}
              {skill.verification_requirement_display || "Document Upload"}
            </p>
          )}
        </div>
      </div>

      {/* Right Section: Status & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0">
        {/* Desktop Status Indicator */}
        <div className="hidden sm:block text-right mr-2">
          {skill.verification_status === "verified" ? (
            <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </div>
          ) : skill.verification_status === "pending" ||
            skill.verification_requested ? (
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-amber-600">
                Pending Review
              </span>
              <span className="text-xs text-muted-foreground">
                {skill.updated_at
                  ? `Updated ${new Date(skill.updated_at).toLocaleDateString()}`
                  : "Processing"}
              </span>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs bg-secondary/50 hover:bg-secondary text-secondary-foreground"
              onClick={onRequestVerification}
            >
              Verify Now
            </Button>
          )}
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit}>Edit Details</DropdownMenuItem>
              <DropdownMenuItem onClick={onViewHistory}>
                View History
              </DropdownMenuItem>
              {skill.verification_status !== "verified" && (
                <DropdownMenuItem onClick={onRequestVerification}>
                  Request Verification
                </DropdownMenuItem>
              )}
              <div className="h-px bg-border my-1"></div>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Delete Skill
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function VolunteerSkillsList() {
  const [skills, setSkills] = useState<VolunteerSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${APIURL}/api/volunteer-skills/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setSkills(data.results || []);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      setError("Failed to load skills. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Volunteer Skills
          </CardTitle>
          <CardDescription>
            Manage your expertise and verification status
          </CardDescription>
        </div>
        <Button onClick={() => console.log("Open Add Modal")} size="sm">
          + Add Skill
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading your skills...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Trophy className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium">No skills added yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Add skills to your profile to verify your expertise and match with
              more volunteer opportunities.
            </p>
            <Button
              variant="outline"
              onClick={() => console.log("Open Add Modal")}
            >
              Add your first skill
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((item) => (
              <SkillsCard
                key={item.id}
                skill={item}
                onEdit={() => console.log("Edit", item.id)}
                onRequestVerification={() =>
                  console.log("Request Verification", item.id)
                }
                onViewHistory={() => console.log("View History", item.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

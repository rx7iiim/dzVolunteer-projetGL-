"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  User,
  Award,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface SkillData {
  id: string;
  volunteer_name: string;
  skill_name: string;
  skill_level: string;
  request_date: string;
  status: string;
  evidence: string;
  documents?: { id: string; name: string; url: string }[];
}

export default function SkillReviewPage() {
  const searchParams = useSearchParams();
  const skillId = searchParams.get("skillId");

  const [skill, setSkill] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSkillData = useCallback(async () => {
    if (!skillId) {
      setError("No skill ID provided. Please provide a skill ID in the URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/${skillId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || "Failed to fetch skill data",
        );
      }

      const data = await response.json();
      setSkill(data);
    } catch (err: any) {
      console.error("Error fetching skill data:", err);
      setError(err.message || "Failed to fetch skill verification");
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    fetchSkillData();
  }, [fetchSkillData]);

  const handleReview = async (action: "approve" | "reject") => {
    if (!skill || !skillId) return;

    setReviewing(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/${skillId}/review_skill_verification/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            comment,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || `Failed to ${action} skill`,
        );
      }

      setSuccess(
        `Skill ${action === "approve" ? "approved" : "rejected"} successfully!`,
      );
      // Refresh skill data
      await fetchSkillData();
    } catch (err: any) {
      console.error(`Error ${action}ing skill:`, err);
      setError(err.message || `Failed to ${action} skill`);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!skillId) {
    return (
      <div className="space-y-6 w-full max-w-4xl mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>Please provide a skill ID in the URL to review.</p>
              <p className="text-sm mt-2">
                Example: /admin/skill-review?skillId=123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
          <h3 className="text-lg font-medium mt-2">Skill not found</h3>
          <p className="text-muted-foreground">
            The requested skill verification could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Review Skill Verification
        </h1>
        <p className="text-muted-foreground">
          Review the latest pending verification request for this skill.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/15 text-green-700 p-4 rounded-md flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Skill Verification Request
          </CardTitle>
          <CardDescription>
            Review the details of this skill verification request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Volunteer Information</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>{" "}
                  {skill.volunteer_name}
                </p>
                <p>
                  <span className="font-medium">Request Date:</span>{" "}
                  {new Date(skill.request_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Skill Information</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Skill:</span> {skill.skill_name}
                </p>
                <p>
                  <span className="font-medium">Level:</span>{" "}
                  <Badge variant="outline">{skill.skill_level}</Badge>
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {skill.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Evidence Provided</h3>
            <p className="bg-muted p-4 rounded-md">{skill.evidence}</p>
          </div>

          {skill.documents && skill.documents.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Supporting Documents</h3>
              <div className="space-y-2">
                {skill.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {doc.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="review-comment">Reviewer Comment (Optional)</Label>
            <Textarea
              id="review-comment"
              placeholder="Add any comments for the volunteer..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => handleReview("approve")}
              disabled={reviewing}
            >
              {reviewing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve Skill
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => handleReview("reject")}
              disabled={reviewing}
            >
              <XCircle className="h-4 w-4" />
              Reject Skill
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

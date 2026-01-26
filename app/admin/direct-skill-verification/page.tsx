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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
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
  date_added: string;
  evidence: string;
  is_verified: boolean;
  documents?: { id: string; name: string; url: string }[];
}

export default function DirectSkillVerificationPage() {
  const searchParams = useSearchParams();
  const skillId = searchParams.get("skillId");

  const [skill, setSkill] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [verifying, setVerifying] = useState(false);
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
          errorData.detail || errorData.error || "Failed to fetch skill",
        );
      }

      const data = await response.json();
      setSkill(data);
    } catch (err: any) {
      console.error("Error fetching skill:", err);
      setError(err.message || "Failed to fetch skill");
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    fetchSkillData();
  }, [fetchSkillData]);

  const handleVerify = async () => {
    if (!skill || !decision || !skillId) return;

    setVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/${skillId}/verify/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: decision,
            comment,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || `Failed to ${decision} skill`,
        );
      }

      setSuccess(
        `Skill ${decision === "approve" ? "verified" : "rejected"} successfully!`,
      );
      // Refresh skill data
      await fetchSkillData();
      setDecision(null);
      setComment("");
    } catch (err: any) {
      console.error(`Error ${decision}ing skill:`, err);
      setError(err.message || `Failed to ${decision} skill`);
    } finally {
      setVerifying(false);
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
              <p>Please provide a skill ID in the URL to verify.</p>
              <p className="text-sm mt-2">
                Example: /admin/direct-skill-verification?skillId=123
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
            The requested skill could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Direct Skill Verification
        </h1>
        <p className="text-muted-foreground">
          Directly verify or reject a skill, bypassing the request workflow.
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
            <Award className="h-5 w-5" />
            Skill Verification
          </CardTitle>
          <CardDescription>
            Review and directly verify this skill
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
                  <span className="font-medium">Date Added:</span>{" "}
                  {new Date(skill.date_added).toLocaleDateString()}
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
                  <span className="font-medium">Verified:</span>{" "}
                  {skill.is_verified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Evidence Provided</h3>
            <p className="bg-muted p-4 rounded-md">
              {skill.evidence || "No evidence provided"}
            </p>
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

          <div>
            <Label>Verification Decision</Label>
            <div className="flex gap-4 mt-2">
              <Button
                variant={decision === "approve" ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={() => setDecision("approve")}
              >
                <CheckCircle className="h-4 w-4" />
                Approve Skill
              </Button>
              <Button
                variant={decision === "reject" ? "destructive" : "outline"}
                className="flex items-center gap-2"
                onClick={() => setDecision("reject")}
              >
                <XCircle className="h-4 w-4" />
                Reject Skill
              </Button>
            </div>
          </div>

          <Button
            onClick={handleVerify}
            disabled={!decision || verifying}
            className="w-full"
          >
            {verifying ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              "Submit Verification"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { missionService } from "@/lib/api/missions";

interface Mission {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  organization_name: string;
  sdg_title: string;
  sdg_number: number;
  location: string;
  volunteers_needed: number;
  volunteers_approved: number;
  status: string;
  estimated_total_hours: number;
}

interface RequiredSkill {
  skill_name: string;
  min_proficiency: string;
  verification_required: boolean;
  volunteer_has_skill: boolean;
  volunteer_proficiency: string;
  meets_proficiency: boolean;
  is_verified: boolean;
  verification_status: string;
}

interface RequirementCheckResponse {
  required_skills: RequiredSkill[];
  preferred_skills: any[];
  volunteer_qualifications: any[];
  missing_requirements: string[];
  can_apply: boolean;
  already_applied: boolean;
}

export default function ApplyToMissionPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const resolvedParams = use(params);
  const missionId = resolvedParams.missionId;

  console.log("[ApplyToMissionPage] Mission ID from params:", missionId);

  const [mission, setMission] = useState<Mission | null>(null);
  const [requirements, setRequirements] =
    useState<RequirementCheckResponse | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingRequirements, setCheckingRequirements] = useState(false);
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissionDetails = async () => {
      try {
        // Auto-check requirements when page loads
        await checkRequirementsOnLoad();
        setLoading(false);
      } catch (err) {
        setError("Failed to load mission details");
        setLoading(false);
      }
    };

    fetchMissionDetails();
  }, [missionId]);

  const checkRequirementsOnLoad = async () => {
    try {
      console.log(
        "[checkRequirementsOnLoad] Checking requirements for mission:",
        missionId,
      );
      const response = await missionService.checkMissionRequirements(missionId);
      console.log("[checkRequirementsOnLoad] Response:", response.data);
      setRequirements(response.data);
    } catch (err: any) {
      console.error("[checkRequirementsOnLoad] Error:", err);
      // Don't set error here, just log it - requirements check is optional
    }
  };

  const checkRequirements = async () => {
    setCheckingRequirements(true);
    setError(null);

    try {
      console.log(
        "[checkRequirements] Checking requirements for mission:",
        missionId,
      );
      const response = await missionService.checkMissionRequirements(missionId);
      console.log("[checkRequirements] Response:", response.data);
      setRequirements(response.data);
    } catch (err: any) {
      console.error("[checkRequirements] Error:", err);
      setError(
        "Failed to check requirements: " +
          (err.response?.data?.error || err.message || "Unknown error"),
      );
    } finally {
      setCheckingRequirements(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setError(null);

    try {
      const response = await missionService.applyToMission(missionId, {
        application_message: applicationMessage,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Optionally redirect or reset form
      }, 3000);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to submit application. Please try again.");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Apply to Mission</h1>
        <p className="text-lg text-muted-foreground">
          Submit your application for this mission
        </p>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6 flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500">
          <CardContent className="pt-6 flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Application submitted successfully!</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Check Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Before applying, check if you meet the requirements for this
            mission.
          </p>
          <Button
            onClick={checkRequirements}
            disabled={checkingRequirements}
            className="w-full sm:w-auto"
          >
            {checkingRequirements ? "Checking..." : "Check Requirements"}
          </Button>

          {requirements && (
            <div className="mt-6 space-y-4">
              {/* Can Apply Status */}
              <div className="flex items-center gap-2">
                <span className="font-medium">Application Status:</span>
                {requirements.already_applied ? (
                  <Badge variant="secondary">Already Applied</Badge>
                ) : requirements.can_apply ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Eligible to Apply
                  </Badge>
                ) : (
                  <Badge variant="destructive">Cannot Apply</Badge>
                )}
              </div>

              {/* Required Skills */}
              {requirements.required_skills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Required Skills</h4>
                  <div className="space-y-2">
                    {requirements.required_skills.map((skill, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 bg-slate-50"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-medium">
                            {skill.skill_name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Min: {skill.min_proficiency}
                          </Badge>
                          {skill.verification_required && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                            >
                              <Shield className="h-3 w-3 mr-1" /> Verification
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {skill.volunteer_has_skill ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> You have
                              this skill
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" /> Missing skill
                            </Badge>
                          )}
                          {skill.volunteer_has_skill && (
                            <>
                              <Badge variant="outline">
                                Your level: {skill.volunteer_proficiency}
                              </Badge>
                              {skill.meets_proficiency ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Meets
                                  proficiency
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" /> Below
                                  required level
                                </Badge>
                              )}
                            </>
                          )}
                          {skill.verification_required && (
                            <Badge
                              variant="outline"
                              className={
                                skill.is_verified
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {skill.is_verified ? (
                                <>
                                  <ShieldCheck className="h-3 w-3 mr-1" />{" "}
                                  Verified
                                </>
                              ) : (
                                <>
                                  <ShieldAlert className="h-3 w-3 mr-1" />{" "}
                                  {skill.verification_status}
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Requirements */}
              {requirements.missing_requirements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-destructive">
                    Missing Requirements
                  </h4>
                  <ul className="space-y-1">
                    {requirements.missing_requirements.map((req, index) => (
                      <li
                        key={index}
                        className="text-sm text-destructive flex items-start gap-2"
                      >
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!requirements?.already_applied && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Application</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmitApplication}>
            <CardContent className="space-y-4">
              {/* Show message if user cannot apply */}
              {requirements && !requirements.can_apply && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      You cannot apply to this mission yet
                    </p>
                    <p className="text-sm mt-1">
                      Please ensure you have all required skills with the
                      necessary proficiency levels and verifications before
                      applying.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="application-message">Application Message</Label>
                <Textarea
                  id="application-message"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the organization why you'd like to participate in this mission..."
                  rows={4}
                  disabled={!requirements?.can_apply}
                />
                <p className="text-sm text-muted-foreground">
                  This message will be sent to the organization when you apply.
                </p>
              </div>

              <Button
                type="submit"
                disabled={
                  applying ||
                  !requirements?.can_apply ||
                  requirements?.already_applied
                }
                className="w-full sm:w-auto"
              >
                {applying
                  ? "Submitting..."
                  : requirements?.can_apply
                    ? "Apply to Mission"
                    : "Cannot Apply - Missing Requirements"}
              </Button>
            </CardContent>
          </form>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, Calendar, CheckCircle, AlertCircle } from "lucide-react";
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

interface RequirementSummary {
  mission_id: string;
  mission_title: string;
  requirements_summary: {
    meets_proficiency: boolean;
    missing_skills: string[];
    meets_skills: string[];
    volunteer_proficiency: string;
    required_proficiency: string;
  };
  already_applied: boolean;
  application_status: string | null;
}

export default function ApplyToMissionPage({ params }: { params: { missionId: string } }) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [requirements, setRequirements] = useState<RequirementSummary | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingRequirements, setCheckingRequirements] = useState(false);
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissionDetails = async () => {
      try {
        // In a real app, you would fetch the specific mission details
        // For now, we'll simulate with mock data or fetch from API
        setLoading(false);
      } catch (err) {
        setError("Failed to load mission details");
        setLoading(false);
      }
    };

    fetchMissionDetails();
  }, [params.missionId]);

  const checkRequirements = async () => {
    setCheckingRequirements(true);
    setError(null);

    try {
      const response = await missionService.checkMissionRequirements(params.missionId);
      setRequirements(response.data);
    } catch (err: any) {
      setError("Failed to check requirements: " + err.response?.data?.error || "Unknown error");
    } finally {
      setCheckingRequirements(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setError(null);

    try {
      const response = await missionService.applyToMission(params.missionId, {
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
        <p className="text-lg text-muted-foreground">Submit your application for this mission</p>
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
            Before applying, check if you meet the requirements for this mission.
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
              <h3 className="font-semibold">Requirements Summary for: {requirements.mission_title}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Proficiency:</span>
                  <Badge variant={requirements.requirements_summary.meets_proficiency ? "default" : "destructive"}>
                    {requirements.requirements_summary.meets_proficiency ? "Meets Requirements" : "Does Not Meet Requirements"}
                  </Badge>
                </div>
                
                {requirements.requirements_summary.meets_skills.length > 0 && (
                  <div>
                    <p className="font-medium">Skills You Have:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {requirements.requirements_summary.meets_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {requirements.requirements_summary.missing_skills.length > 0 && (
                  <div>
                    <p className="font-medium">Missing Skills:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {requirements.requirements_summary.missing_skills.map((skill, index) => (
                        <Badge key={index} variant="destructive">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {requirements.already_applied ? (
                    <Badge variant="secondary">Already Applied ({requirements.application_status})</Badge>
                  ) : (
                    <Badge variant="default">Ready to Apply</Badge>
                  )}
                </div>
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="application-message">Application Message</Label>
                <Textarea
                  id="application-message"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the organization why you'd like to participate in this mission..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  This message will be sent to the organization when you apply.
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={applying || !requirements?.requirements_summary.meets_proficiency}
                className="w-full sm:w-auto"
              >
                {applying ? "Submitting..." : "Apply to Mission"}
              </Button>
            </CardContent>
          </form>
        </Card>
      )}
    </div>
  );
}
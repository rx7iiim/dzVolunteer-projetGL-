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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Award,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface VerificationRequest {
  id: string;
  volunteer_name: string;
  skill_name: string;
  skill_level: string;
  request_date: string;
  status: string;
  evidence: string;
  reviewer_comment: string | null;
}

export default function SkillVerificationRequestsPage() {
  const searchParams = useSearchParams();
  const skillId = searchParams.get("skillId");

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVerificationRequests = useCallback(async () => {
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
        `${APIURL}/api/volunteer-skills/${skillId}/verification_requests/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            errorData.error ||
            "Failed to fetch verification requests",
        );
      }

      const data = await response.json();
      const requestList = Array.isArray(data) ? data : data.results || [];
      setRequests(requestList);
    } catch (err: any) {
      console.error("Error fetching verification requests:", err);
      setError(err.message || "Failed to fetch verification requests");
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    fetchVerificationRequests();
  }, [fetchVerificationRequests]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.volunteer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skill_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Skill Verification Requests
        </h1>
        <p className="text-muted-foreground">
          View all verification requests for a specific skill.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {!skillId ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>
                Please provide a skill ID in the URL to view verification
                requests.
              </p>
              <p className="text-sm mt-2">
                Example: /admin/skill-verification-requests?skillId=123
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>
                All verification requests for skill ID: {skillId}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search requests..."
                className="pl-8 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No verification requests found for this skill.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Skill</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Comment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {request.volunteer_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            {request.skill_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.skill_level}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.request_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className="truncate max-w-[120px] block"
                            title={request.evidence}
                          >
                            {request.evidence}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusVariant(request.status)}>
                            {request.status === "pending" && (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {request.status === "approved" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {request.status === "rejected" && (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.reviewer_comment ? (
                            <span className="text-sm text-muted-foreground">
                              {request.reviewer_comment}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              No comment
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

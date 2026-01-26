"use client";

import { useState, useEffect, useCallback } from "react";
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
  CheckCircle,
  XCircle,
  Clock,
  Search,
  AlertCircle,
  User,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

export default function SkillsVerificationPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchPendingVerifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/pending_verification_requests/`,
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
            "Failed to fetch pending verification requests",
        );
      }

      const data = await response.json();
      const requests = Array.isArray(data) ? data : data.results || [];
      setVerifications(requests);
    } catch (err: any) {
      console.error("Error fetching pending verifications:", err);
      setError(err.message || "Failed to fetch verification requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingVerifications();
  }, [fetchPendingVerifications]);

  const handleReview = async (action: "approve" | "reject") => {
    if (!selectedRequest) return;

    setReviewing(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/review_verification/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            request_id: selectedRequest.id,
            action,
            comment: reviewComment,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || `Failed to ${action} request`,
        );
      }

      // Refresh the list
      await fetchPendingVerifications();
      setReviewModalOpen(false);
      setSelectedRequest(null);
      setReviewComment("");
    } catch (err: any) {
      console.error(`Error ${action}ing verification:`, err);
      setError(err.message || `Failed to ${action} verification`);
    } finally {
      setReviewing(false);
    }
  };

  const openReviewModal = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setReviewComment("");
    setReviewModalOpen(true);
  };

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

  const filteredVerifications = verifications.filter(
    (v) =>
      v.volunteer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.skill_name?.toLowerCase().includes(searchQuery.toLowerCase()),
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
          Skills Verification
        </h1>
        <p className="text-muted-foreground">
          Review and manage pending skill verification requests.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Pending Verification Requests</CardTitle>
            <CardDescription>
              Review and approve/reject skill verification requests
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search verifications..."
              className="pl-8 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredVerifications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No pending verification requests found.
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVerifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {verification.volunteer_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          {verification.skill_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {verification.skill_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          verification.request_date,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className="truncate max-w-[120px] block"
                          title={verification.evidence}
                        >
                          {verification.evidence}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusVariant(verification.status)}
                        >
                          {verification.status === "pending" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {verification.status === "approved" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {verification.status === "rejected" && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {verification.status.charAt(0).toUpperCase() +
                            verification.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewModal(verification)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this skill verification request.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Volunteer</Label>
                  <p className="font-medium">
                    {selectedRequest.volunteer_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Skill</Label>
                  <p className="font-medium">{selectedRequest.skill_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Level</Label>
                  <Badge variant="outline">{selectedRequest.skill_level}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Request Date</Label>
                  <p className="font-medium">
                    {new Date(
                      selectedRequest.request_date,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Evidence</Label>
                <p className="bg-muted p-3 rounded-md mt-1">
                  {selectedRequest.evidence}
                </p>
              </div>

              <div>
                <Label htmlFor="review-comment">
                  Reviewer Comment (Optional)
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder="Add any comments for the volunteer..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleReview("reject")}
              disabled={reviewing}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => handleReview("approve")}
              disabled={reviewing}
              className="flex items-center gap-2"
            >
              {reviewing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

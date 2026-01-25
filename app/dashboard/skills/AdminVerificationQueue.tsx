"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle, // You can remove this if you remove the old buttons
  FileText,
  Link as LinkIcon,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Search,
  Eye,
  Gavel,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// UI Components
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminReviewModal from "./AdminVerificationDecision";

export default function AdminVerificationQueue() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Request for Details Modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // NEW: State for the Decision Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // --- Fetch Logic ---
  const fetchRequests = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");

      // Construct URL with pagination
      const response = await fetch(
        `${APIURL}/api/volunteer-skills/pending_verification_requests/?page=${page}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 403)
          throw new Error("Unauthorized: Admin access required.");
        throw new Error("Failed to fetch pending requests.");
      }

      const data = await response.json();

      setRequests(data.results);
      setTotalCount(data.count);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  // --- Handlers ---
  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && hasNext) setCurrentPage((p) => p + 1);
    if (direction === "prev" && hasPrev) setCurrentPage((p) => p - 1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Verification Queue
          </h2>
          <p className="text-muted-foreground">
            Review and approve volunteer skill submissions.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {totalCount} Pending
        </Badge>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="border rounded-md bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Volunteer</TableHead>
              <TableHead>Skill</TableHead>
              <TableHead>Date Requested</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-muted-foreground text-sm">
                      Loading requests...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  All caught up! No pending requests.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {req.volunteer_name}
                      </span>
                      <span className="text-xs text-muted-foreground pl-5">
                        {req.volunteer_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{req.skill_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {req.skill_category}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(req.request_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {req.request_documents ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-blue-200 text-blue-700 bg-blue-50"
                        >
                          <FileText className="h-3 w-3" /> Doc
                        </Badge>
                      ) : null}
                      {req.request_links && req.request_links.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-indigo-200 text-indigo-700 bg-indigo-50"
                        >
                          <LinkIcon className="h-3 w-3" />{" "}
                          {req.request_links.length} Link
                          {req.request_links.length > 1 ? "s" : ""}
                        </Badge>
                      ) : null}
                      {!req.request_documents &&
                        (!req.request_links ||
                          req.request_links.length === 0) && (
                          <span className="text-xs text-muted-foreground italic">
                            No attachments
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => setSelectedRequest(req)}>
                      <Eye className="h-4 w-4 mr-2" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/20">
          <span className="text-xs text-muted-foreground">
            Page {currentPage}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("prev")}
              disabled={!hasPrev || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("next")}
              disabled={!hasNext || loading}
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* --- REVIEW MODAL (Read Only / Details) --- */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle>Review Verification Request</DialogTitle>
                    <DialogDescription>
                      Review the evidence provided by{" "}
                      <strong>{selectedRequest.volunteer_name}</strong> for{" "}
                      <strong>{selectedRequest.skill_name}</strong>.
                    </DialogDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="mt-1 bg-amber-50 text-amber-700 border-amber-200"
                  >
                    Pending
                  </Badge>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 py-4 px-1">
                  {/* Notes Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium leading-none">
                      Applicant Notes
                    </h4>
                    <div className="rounded-md bg-muted p-4 text-sm italic text-muted-foreground">
                      "{selectedRequest.request_notes || "No notes provided."}"
                    </div>
                  </div>

                  {/* Evidence Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium leading-none">
                      Submitted Evidence
                    </h4>

                    {/* Document */}
                    {selectedRequest.request_documents ? (
                      <div className="flex items-center justify-between p-3 border rounded-md bg-card">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Supporting Document
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF/Image uploaded by applicant
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={selectedRequest.request_documents}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        </Button>
                      </div>
                    ) : null}

                    {/* Links */}
                    {selectedRequest.request_links &&
                    selectedRequest.request_links.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRequest.request_links.map(
                          (link: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 border rounded-md bg-card"
                            >
                              <div className="h-10 w-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <LinkIcon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium">
                                  External Link
                                </p>
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-blue-600 hover:underline truncate block"
                                >
                                  {link}
                                </a>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : null}

                    {!selectedRequest.request_documents &&
                      (!selectedRequest.request_links ||
                        selectedRequest.request_links.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No documents or links were submitted with this
                          request.
                        </p>
                      )}
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="default"
                    onClick={() => setReviewModalOpen(true)} // This now opens the AdminReviewModal
                    className="w-full bg-primary text-primary-foreground"
                  >
                    <Gavel className="mr-2 h-4 w-4" /> Make Decision
                  </Button>
                </div>

                {/* REMOVED: The old "Reject/Approve" placeholder buttons are gone */}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- DECISION MODAL (The new component) --- */}
      {selectedRequest && (
        <AdminReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => {
            fetchRequests(currentPage); // Refresh list
            setSelectedRequest(null); // Close details modal
          }}
          mode="request"
          entityId={selectedRequest.id} // Pass the request ID
          contextData={{
            volunteerName: selectedRequest.volunteer_name,
            skillName: selectedRequest.skill_name,
          }}
        />
      )}
    </div>
  );
}

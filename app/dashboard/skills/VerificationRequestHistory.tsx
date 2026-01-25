"use client";

import { useState, useEffect } from "react";
import {
  History,
  Loader2,
  FileText,
  Link as LinkIcon,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// UI Components
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface VerificationRequestHistoryProps {
  skillId: string;
}

export default function VerificationRequestHistory({
  skillId,
}: VerificationRequestHistoryProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Logic ---
  useEffect(() => {
    if (skillId) {
      fetchHistory(skillId);
    }
  }, [skillId]);

  const fetchHistory = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${APIURL}/api/volunteer-skills/${id}/verification_requests/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load history.");
      }

      const data = await response.json();
      setRequests(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <>
      <DialogHeader className="pb-4 border-b">
        <DialogTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Verification History
        </DialogTitle>
        <DialogDescription>
          View past verification requests and admin feedback for this skill.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-hidden relative mt-4 max-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-destructive font-medium">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
            <History className="h-12 w-12 mb-3 opacity-20" />
            <p>No verification requests found.</p>
            <p className="text-xs mt-1">
              Submit a request to verify this skill.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 pb-6">
              {requests.map((req, index) => (
                <div
                  key={req.id}
                  className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0 last:border-l-0"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary" />

                  <div className="space-y-3">
                    {/* Header: Date & Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Request Date
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatDate(req.request_date || req.created_at)}
                        </p>
                      </div>
                      {getStatusBadge(req.review_status)}
                    </div>

                    {/* Content Card */}
                    <div className="rounded-lg border bg-card p-4 shadow-sm space-y-4">
                      {/* User Notes */}
                      {req.request_notes && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                            <MessageSquare className="h-3 w-3" /> Your Notes
                          </span>
                          <p className="text-sm bg-muted/50 p-2 rounded-md italic text-muted-foreground">
                            "{req.request_notes}"
                          </p>
                        </div>
                      )}

                      {/* Attachments */}
                      {(req.request_documents ||
                        (req.request_links &&
                          req.request_links.length > 0)) && (
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Submitted Evidence
                          </span>
                          <div className="grid gap-2">
                            {/* Document */}
                            {req.request_documents && (
                              <a
                                href={req.request_documents}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs p-2 rounded border bg-background hover:bg-accent transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                                <span className="truncate flex-1">
                                  View Attached Document
                                </span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </a>
                            )}
                            {/* Links */}
                            {req.request_links?.map(
                              (link: string, i: number) => (
                                <a
                                  key={i}
                                  href={link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 text-xs p-2 rounded border bg-background hover:bg-accent transition-colors"
                                >
                                  <LinkIcon className="h-3.5 w-3.5 text-indigo-500" />
                                  <span className="truncate flex-1">
                                    {link}
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </a>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Review Details */}
                      {(req.review_date || req.review_notes) && (
                        <>
                          <Separator />
                          <div className="bg-muted/30 -mx-4 -mb-4 p-4 mt-2 rounded-b-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-foreground flex items-center gap-1">
                                Admin Feedback
                              </span>
                              {req.review_date && (
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDate(req.review_date)}
                                </span>
                              )}
                            </div>

                            {req.review_notes ? (
                              <p className="text-sm text-foreground">
                                {req.review_notes}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">
                                No feedback provided.
                              </p>
                            )}

                            {req.reviewed_by_name && (
                              <p className="text-[10px] text-muted-foreground mt-2 text-right">
                                Reviewed by: {req.reviewed_by_name}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </>
  );
}

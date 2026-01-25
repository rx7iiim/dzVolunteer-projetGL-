"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Lock,
  MessageSquare,
  Shield,
  HelpCircle,
  Gavel,
} from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

// UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ReviewMode = "request" | "direct";

interface AdminReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: ReviewMode;
  entityId: string; // If mode='request' -> request_id. If mode='direct' -> skill_id
  contextData?: {
    volunteerName: string;
    skillName: string;
  };
}

export default function AdminReviewModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  entityId,
  contextData,
}: AdminReviewModalProps) {
  // --- State ---
  const [status, setStatus] = useState<string>("");
  const [publicNotes, setPublicNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState(""); // Only for 'request' mode
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStatus("");
      setPublicNotes("");
      setAdminNotes("");
      setError(null);
    }
  }, [isOpen]);

  // --- Handlers ---
  const handleSubmit = async () => {
    if (!status) {
      setError("Please select a review status decision.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      let url = "";
      let body: any = {};

      if (mode === "request") {
        // 1. Review Verification Request (General Endpoint)
        url = `${APIURL}/api/volunteer-skills/review_verification/`;
        body = {
          verification_request_id: entityId, // Explicitly extracted from body as per docs
          review_status: status,
          review_notes: publicNotes,
          admin_notes: adminNotes,
        };
      } else {
        // 2. Direct Verify (Bypass Endpoint)
        url = `${APIURL}/api/volunteer-skills/${entityId}/verify/`;
        body = {
          verification_status: status, // "verified" or "rejected"
          verification_notes: publicNotes, // Maps to verification_notes
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          // Handle specific validation errors
          const msg = data.review_status
            ? data.review_status[0]
            : data.detail || "Invalid Request";
          throw new Error(msg);
        }
        throw new Error("Failed to submit review.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper: Dynamic Content based on Mode ---
  const getModalTitle = () =>
    mode === "request"
      ? "Review Verification Request"
      : "Directly Manage Skill";
  const getModalDesc = () =>
    mode === "request"
      ? `Decide on the evidence provided by ${contextData?.volunteerName || "the volunteer"}.`
      : `Manually override status for ${contextData?.skillName || "this skill"}. This bypasses the request queue.`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>{getModalDesc()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* 1. Decision Selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Decision</Label>

            {mode === "request" ? (
              // Request Mode: Offers Approved, Rejected, Needs Info, Under Review
              <RadioGroup
                value={status}
                onValueChange={setStatus}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer ${status === "approved" ? "border-green-500 bg-green-50" : ""}`}
                >
                  <RadioGroupItem value="approved" className="sr-only" />
                  <CheckCircle2
                    className={`mb-3 h-6 w-6 ${status === "approved" ? "text-green-600" : "text-muted-foreground"}`}
                  />
                  <span className="text-sm font-medium">Approve</span>
                </Label>

                <Label
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer ${status === "rejected" ? "border-red-500 bg-red-50" : ""}`}
                >
                  <RadioGroupItem value="rejected" className="sr-only" />
                  <XCircle
                    className={`mb-3 h-6 w-6 ${status === "rejected" ? "text-red-600" : "text-muted-foreground"}`}
                  />
                  <span className="text-sm font-medium">Reject</span>
                </Label>

                <Label
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer ${status === "needs_more_info" ? "border-amber-500 bg-amber-50" : ""}`}
                >
                  <RadioGroupItem value="needs_more_info" className="sr-only" />
                  <HelpCircle
                    className={`mb-3 h-6 w-6 ${status === "needs_more_info" ? "text-amber-600" : "text-muted-foreground"}`}
                  />
                  <span className="text-sm font-medium">Needs Info</span>
                </Label>

                <Label
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer ${status === "under_review" ? "border-blue-500 bg-blue-50" : ""}`}
                >
                  <RadioGroupItem value="under_review" className="sr-only" />
                  <Shield
                    className={`mb-3 h-6 w-6 ${status === "under_review" ? "text-blue-600" : "text-muted-foreground"}`}
                  />
                  <span className="text-sm font-medium">Reviewing</span>
                </Label>
              </RadioGroup>
            ) : (
              // Direct Mode: Only Verified or Rejected
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={status === "verified" ? "default" : "outline"}
                  className={`h-20 flex flex-col gap-2 ${status === "verified" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  onClick={() => setStatus("verified")}
                >
                  <CheckCircle2 className="h-6 w-6" />
                  Verify Skill
                </Button>
                <Button
                  type="button"
                  variant={status === "rejected" ? "default" : "outline"}
                  className={`h-20 flex flex-col gap-2 ${status === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}`}
                  onClick={() => setStatus("rejected")}
                >
                  <XCircle className="h-6 w-6" />
                  Reject Skill
                </Button>
              </div>
            )}
          </div>

          {/* 2. Public Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              {mode === "request"
                ? "Review Feedback (Public)"
                : "Verification Notes"}
            </Label>
            <Textarea
              placeholder={
                mode === "request"
                  ? "Message to the volunteer explaining the decision..."
                  : "Reason for manual verification..."
              }
              value={publicNotes}
              onChange={(e) => setPublicNotes(e.target.value)}
              className="resize-none h-24"
            />
            {mode === "request" && (
              <p className="text-xs text-muted-foreground">
                The volunteer will see this message.
              </p>
            )}
          </div>

          {/* 3. Admin Internal Notes (Request Mode Only) */}
          {mode === "request" && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                <Lock className="h-4 w-4" />
                Internal Admin Notes
              </Label>
              <Textarea
                placeholder="Private notes for other admins..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="resize-none bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !status}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface RatingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  participationId: string;
}

interface RatingStatus {
  has_rated_volunteer: boolean;
  has_been_rated_by_volunteer: boolean;
  volunteer_rating: number | null;
  organization_rating: number | null;
  volunteer_review: string | null;
  organization_review: string | null;
}

export default function RatingStatusModal({
  isOpen,
  onClose,
  participationId,
}: RatingStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingStatus, setRatingStatus] = useState<RatingStatus | null>(null);

  useEffect(() => {
    if (isOpen && participationId) {
      fetchRatingStatus();
    }
  }, [isOpen, participationId]);

  const fetchRatingStatus = async () => {
    if (!participationId) return;

    const APIURL = process.env.NEXT_PUBLIC_API_URL;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${APIURL}/api/missions/participations/${participationId}/rating-status/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.detail ||
          errorData.error ||
          response.statusText ||
          "Failed to fetch rating status";
        throw new Error(message);
      }

      const data = await response.json();
      setRatingStatus(data);
    } catch (err: any) {
      console.error("Failed to fetch rating status:", err);
      setError(err.message || "Failed to fetch rating status");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setRatingStatus(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetModal();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rating Status</DialogTitle>
          <DialogDescription>
            View the rating status between you and the volunteer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ratingStatus ? (
          <div className="space-y-4 py-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">Your Rating of Volunteer</span>
                <div className="flex items-center gap-2">
                  {ratingStatus.has_rated_volunteer ? (
                    <>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (ratingStatus.volunteer_rating || 0)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Not rated</span>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </>
                  )}
                </div>
              </div>

              {ratingStatus.volunteer_review && (
                <div className="p-3 bg-slate-50 rounded-lg text-sm">
                  <p className="font-medium mb-1">Your Review:</p>
                  <p className="text-muted-foreground">{ratingStatus.volunteer_review}</p>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">Volunteer's Rating of You</span>
                <div className="flex items-center gap-2">
                  {ratingStatus.has_been_rated_by_volunteer ? (
                    <>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (ratingStatus.organization_rating || 0)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Not rated</span>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </>
                  )}
                </div>
              </div>

              {ratingStatus.organization_review && (
                <div className="p-3 bg-slate-50 rounded-lg text-sm">
                  <p className="font-medium mb-1">Volunteer's Review:</p>
                  <p className="text-muted-foreground">{ratingStatus.organization_review}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No rating information available
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
import { Star, Loader2, AlertCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RateVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  participationId: string;
  volunteerName: string;
  onSuccess: () => void;
}

export default function RateVolunteerModal({
  isOpen,
  onClose,
  participationId,
  volunteerName,
  onSuccess,
}: RateVolunteerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating <= 0) {
      setError("Please select a rating");
      return;
    }

    const APIURL = process.env.NEXT_PUBLIC_API_URL;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${APIURL}/api/missions/participations/${participationId}/rate/organization/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          review,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.detail ||
          errorData.error ||
          response.statusText ||
          "Failed to rate volunteer";
        throw new Error(message);
      }

      // Reset form and close modal
      setRating(0);
      setReview("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to rate volunteer:", err);
      setError(err.message || "Failed to rate volunteer");
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starNumber: number) => {
    setRating(starNumber);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate Volunteer</DialogTitle>
          <DialogDescription>
            Rate {volunteerName} for their participation in this mission.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((starNumber) => (
                <button
                  key={starNumber}
                  type="button"
                  onClick={() => handleStarClick(starNumber)}
                  className={`text-2xl ${starNumber <= rating ? 'text-yellow-500' : 'text-gray-300'} focus:outline-none`}
                >
                  <Star fill={starNumber <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating > 0 ? `You rated ${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Provide feedback about the volunteer's performance..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Rating
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
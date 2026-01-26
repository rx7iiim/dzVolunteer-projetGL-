"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Globe } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddSdgToMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  onSuccess: () => void;
}

export default function AddSdgToMissionModal({
  isOpen,
  onClose,
  missionId,
  onSuccess,
}: AddSdgToMissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSdg, setSelectedSdg] = useState<string>("");

  // Example SDGs - (Ensure these match your backend IDs or fetch them dynamically)
  const sdgOptions = [
    { id: 1, name: "No Poverty" },
    { id: 2, name: "Zero Hunger" },
    { id: 3, name: "Good Health and Well-being" },
    { id: 4, name: "Quality Education" },
    { id: 5, name: "Gender Equality" },
    { id: 6, name: "Clean Water and Sanitation" },
    { id: 7, name: "Affordable and Clean Energy" },
    { id: 8, name: "Decent Work and Economic Growth" },
    { id: 9, name: "Industry, Innovation and Infrastructure" },
    { id: 10, name: "Reduced Inequalities" },
    { id: 11, name: "Sustainable Cities and Communities" },
    { id: 12, name: "Responsible Consumption and Production" },
    { id: 13, name: "Climate Action" },
    { id: 14, name: "Life Below Water" },
    { id: 15, name: "Life on Land" },
    { id: 16, name: "Peace, Justice and Strong Institutions" },
    { id: 17, name: "Partnerships for the Goals" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSdg) {
      setError("Please select an SDG");
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

      const response = await fetch(`${APIURL}/api/missions/${missionId}/add-sdg/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sdg_id: selectedSdg,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.detail ||
          errorData.error ||
          response.statusText ||
          "Failed to add SDG to mission";
        throw new Error(message);
      }

      // Reset form and close modal
      setSelectedSdg("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to add SDG to mission:", err);
      setError(err.message || "Failed to add SDG to mission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add SDG to Mission</DialogTitle>
          <DialogDescription>
            Select a Sustainable Development Goal to associate with this mission.
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
            <Label htmlFor="sdg">Sustainable Development Goal (SDG)</Label>
            <Select
              value={selectedSdg}
              onValueChange={setSelectedSdg}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an SDG" />
              </SelectTrigger>
              <SelectContent>
                {sdgOptions.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {s.id}. {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add SDG to Mission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
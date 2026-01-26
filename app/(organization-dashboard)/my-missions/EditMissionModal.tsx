"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";

interface EditMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  onSuccess: () => void;
}

export default function EditMissionModal({
  isOpen,
  onClose,
  missionId,
  onSuccess,
}: EditMissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    estimated_total_hours: "",
    volunteers_needed: "",
    status: "draft",
  });

  // Fetch mission data when modal opens
  const fetchMissionData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const APIURL = process.env.NEXT_PUBLIC_API_URL;

      // Fetch from my-missions endpoint to find the specific mission
      const response = await fetch(`${APIURL}/api/missions/my-missions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch missions list");
      }

      const data = await response.json();
      const missions = Array.isArray(data)
        ? data
        : data.results
          ? data.results
          : data.missions
            ? data.missions
            : [];

      const mission = missions.find((m: any) => m.id === missionId);

      if (!mission) {
        throw new Error("Mission not found");
      }

      // Format dates for input fields (YYYY-MM-DD)
      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
      };

      setFormData({
        title: mission.title || "",
        description: mission.description || "",
        start_date: formatDate(mission.start_date),
        end_date: formatDate(mission.end_date),
        location: mission.location || "",
        estimated_total_hours: mission.estimated_total_hours?.toString() || "0",
        volunteers_needed: mission.volunteers_needed?.toString() || "1",
        status: mission.status || "draft",
      });
    } catch (err: any) {
      console.error("Failed to fetch mission data:", err);
      setError(err.message || "Failed to fetch mission data");
    } finally {
      setInitialLoading(false);
    }
  }, [missionId]);

  // Fetch mission data when modal opens
  useEffect(() => {
    if (isOpen && missionId) {
      fetchMissionData();
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
        estimated_total_hours: "",
        volunteers_needed: "",
        status: "draft",
      });
      setError(null);
    }
  }, [isOpen, missionId, fetchMissionData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Helper to format dates correctly for the API (ISO String)
    const toDateTime = (dateStr: string) => {
      if (!dateStr) return null;
      // Appends current time or midnight to satisfy datetime requirements
      return new Date(dateStr).toISOString();
    };

    // Prepare the payload
    const payload = {
      title: formData.title,
      description: formData.description,
      start_date: toDateTime(formData.start_date),
      end_date: toDateTime(formData.end_date),
      location: formData.location,
      estimated_total_hours: parseInt(formData.estimated_total_hours) || 0,
      volunteers_needed: parseInt(formData.volunteers_needed) || 1,
      status: formData.status,
      // Keep other fields that might be required but not editable
      application_deadline: toDateTime(formData.start_date), // Use start date as deadline if not specified
      proficiency_level: "beginner", // Default value
      mission_type: "Local", // Default value
      sdg: null, // Default value, can be updated via add-sdg endpoint
    };

    const APIURL = process.env.NEXT_PUBLIC_API_URL;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${APIURL}/api/missions/${missionId}/`, {
        method: "PUT", // Using PUT for full resource update
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.detail ||
          errorData.error ||
          response.statusText ||
          "Failed to update mission";
        throw new Error(message);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to update mission:", err);
      setError(err.message || "Failed to update mission");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Edit Mission</DialogTitle>
          <DialogDescription>
            Update the details of your mission.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {initialLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Mission Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Community Park Cleanup"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe tasks and goals..."
                required
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. Oran"
                  required
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(val) => handleSelectChange("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_total_hours">
                  Total Hours (Est.)
                </Label>
                <Input
                  id="estimated_total_hours"
                  name="estimated_total_hours"
                  type="number"
                  required
                  value={formData.estimated_total_hours}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volunteers_needed">Volunteers Needed</Label>
                <Input
                  id="volunteers_needed"
                  name="volunteers_needed"
                  type="number"
                  required
                  value={formData.volunteers_needed}
                  onChange={handleChange}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Mission
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

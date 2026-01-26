"use client";

import { useState } from "react";
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

interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMissionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Removed address from state as it is now forced in the body
  const initialFormState = {
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    application_deadline: "",
    estimated_total_hours: "",
    volunteers_needed: "",
    proficiency_level: "beginner",
    mission_type: "Local",
  };

  const [formData, setFormData] = useState(initialFormState);

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
      return new Date(dateStr).toISOString();
    };

    // Calculate application deadline (1 day before start date at 23:59:59)
    const getApplicationDeadline = () => {
      if (!formData.application_deadline && formData.start_date) {
        const startDate = new Date(formData.start_date);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(23, 59, 59, 0);
        return startDate.toISOString();
      }
      // Ensure the manually entered deadline is before start date
      if (formData.application_deadline && formData.start_date) {
        const deadline = new Date(formData.application_deadline);
        const startDate = new Date(formData.start_date);
        if (deadline >= startDate) {
          // Set deadline to 1 day before start date
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(23, 59, 59, 0);
          return startDate.toISOString();
        }
        deadline.setHours(23, 59, 59, 0);
        return deadline.toISOString();
      }
      return toDateTime(formData.application_deadline);
    };

    // Prepare the payload - only required fields
    // Hardcoded values from API testing
    const HARDCODED_ORGANIZATION = "2be861e2-11df-42cc-a3a7-3757f2663574";
    const HARDCODED_ADDRESS = "2bb86be1-b980-4d3e-a780-68a4d6145a4a";
    const HARDCODED_SDG = "132b7ae2-37c2-4199-ba87-380110071c0e";

    const payload: Record<string, unknown> = {
      title: formData.title,
      description: formData.description,
      organization: HARDCODED_ORGANIZATION,
      address: HARDCODED_ADDRESS,
      start_date: toDateTime(formData.start_date),
      end_date: toDateTime(formData.end_date),
      application_deadline: getApplicationDeadline(),
      estimated_total_hours: formData.estimated_total_hours
        ? parseInt(formData.estimated_total_hours)
        : undefined,
      volunteers_needed: parseInt(formData.volunteers_needed),
      proficiency_level: formData.proficiency_level,
      mission_type: "one_time",
      sdg: HARDCODED_SDG,
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    const APIURL = process.env.NEXT_PUBLIC_API_URL;
    console.log("API URL:", APIURL);

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      console.log("Token exists:", !!token);
      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }

      console.log("Making request to:", `${APIURL}/api/missions/create/`);

      const response = await fetch(`${APIURL}/api/missions/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response body:", responseText);

      if (!response.ok) {
        let errorData: { detail?: string; error?: string } = {};
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { detail: responseText };
        }
        const message =
          errorData.detail ||
          errorData.error ||
          response.statusText ||
          "An unknown error occurred while creating the mission.";
        throw new Error(message);
      }

      // Reset Form
      setFormData(initialFormState);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to create mission:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Mission</DialogTitle>
          <DialogDescription>
            Fill in the details to publish a new volunteer opportunity.
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mission Type</Label>
              <Select
                name="mission_type"
                value={formData.mission_type}
                onValueChange={(val) => handleSelectChange("mission_type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proficiency Level</Label>
              <Select
                name="proficiency_level"
                value={formData.proficiency_level}
                onValueChange={(val) =>
                  handleSelectChange("proficiency_level", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
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
              <Label htmlFor="application_deadline">Deadline</Label>
              <Input
                id="application_deadline"
                name="application_deadline"
                type="date"
                required
                value={formData.application_deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="estimated_total_hours">Total Hours (Est.)</Label>
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

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Mission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

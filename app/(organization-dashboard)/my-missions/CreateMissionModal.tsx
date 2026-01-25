"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuthFetch } from "@/hooks/useAuthFetch";

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
  const { authFetch, loading, error } = useAuthFetch();

  // 1. Set Address ID in initial state (Hardcoded)
  const initialFormState = {
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    application_deadline: "",
    estimated_total_hours: "",
    volunteers_needed: "",
    proficiency_level: "Beginner",
    mission_type: "Local",
    sdg: "",
    address: "2bb86be1-b980-4d3e-a780-68a4d6145a4a", // Hardcoded Address ID
  };

  const [formData, setFormData] = useState(initialFormState);

  // Example SDGs - (Ensure these match your backend IDs or fetch them dynamically)
  const sdgOptions = [
    { id: 1, name: "No Poverty" },
    { id: 2, name: "Zero Hunger" },
    { id: 3, name: "Good Health and Well-being" },
    { id: 4, name: "Quality Education" },
    { id: 13, name: "Climate Action" },
    { id: 14, name: "Life Below Water" },
  ];

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
      ...formData,
      // Ensure numbers are numbers
      volunteers_needed: parseInt(formData.volunteers_needed),
      estimated_total_hours: formData.estimated_total_hours
        ? parseInt(formData.estimated_total_hours)
        : 0,

      // Handle Date conversion
      start_date: toDateTime(formData.start_date),
      end_date: toDateTime(formData.end_date),
      application_deadline: toDateTime(formData.application_deadline),

      // Handle SDG (API expects UUID? or ID? Adjust based on your backend)
      // If backend expects integer ID for SDG:
      sdg: formData.sdg ? parseInt(formData.sdg) : null,

      // Address is already set in state as string, no change needed
    };

    const APIURL = process.env.NEXT_PUBLIC_API_URL;

    try {
      await authFetch(`${APIURL}/api/missions/create/`, {
        method: "POST",
        body: payload,
      });

      // Reset Form
      setFormData(initialFormState);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create mission:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sustainable Development Goal (SDG)</Label>
            <Select
              name="sdg"
              value={formData.sdg}
              onValueChange={(val) => handleSelectChange("sdg", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relevant SDG" />
              </SelectTrigger>
              <SelectContent>
                {sdgOptions.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.id}. {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Address Input Removed - ID is hardcoded in submission */}

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

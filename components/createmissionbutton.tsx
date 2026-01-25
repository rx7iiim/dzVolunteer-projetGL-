import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

// --- API Configuration ---
const APIURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---
interface CreateMissionForm {
  title: string;
  description: string;
  organization: number;
  address: number;
  start_date: string;
  end_date: string;
  application_deadline: string;
  estimated_total_hours: number;
  volunteers_needed: number;
  proficiency_level: string;
  mission_type: string;
  sdg: number;
}

interface CreateMissionButtonProps {
  userType?: string;
  userId?: number;
  userToken?: string;
  onSuccess?: () => void;
}

// --- API Function ---
const createMission = async (formData: CreateMissionForm, token: string) => {
  const response = await fetch(`${APIURL}/api/mission/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid input. Please check all fields.");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized. Please log in again.");
    }
    throw new Error(`Failed to create mission: ${response.statusText}`);
  }

  return await response.json();
};

// --- Main Component ---
export function CreateMissionButton({
  userType,
  userId,
  userToken,
  onSuccess,
}: CreateMissionButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Early return if user is not an organization
  if (userType !== "organization") {
    return null;
  }

  const [formData, setFormData] = useState<CreateMissionForm>({
    title: "",
    description: "",
    organization: userId || 0,
    address: 1,
    start_date: "",
    end_date: "",
    application_deadline: "",
    estimated_total_hours: 0,
    volunteers_needed: 0,
    proficiency_level: "Beginner",
    mission_type: "Local",
    sdg: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userToken) {
        throw new Error("No authentication token found");
      }

      await createMission(formData, userToken);
      setOpen(false);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        organization: userId || 0,
        address: 1,
        start_date: "",
        end_date: "",
        application_deadline: "",
        estimated_total_hours: 0,
        volunteers_needed: 0,
        proficiency_level: "Beginner",
        mission_type: "Local",
        sdg: 1,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create mission";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateMissionForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Mission
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Mission</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new volunteer mission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Mission Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Community Park Cleanup"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the mission and what volunteers will do..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="application_deadline">Application Deadline *</Label>
            <Input
              id="application_deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) =>
                handleChange("application_deadline", e.target.value)
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volunteers_needed">Volunteers Needed *</Label>
              <Input
                id="volunteers_needed"
                type="number"
                min="1"
                value={formData.volunteers_needed || ""}
                onChange={(e) =>
                  handleChange(
                    "volunteers_needed",
                    parseInt(e.target.value) || 0,
                  )
                }
                placeholder="10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_total_hours">Estimated Hours *</Label>
              <Input
                id="estimated_total_hours"
                type="number"
                min="1"
                value={formData.estimated_total_hours || ""}
                onChange={(e) =>
                  handleChange(
                    "estimated_total_hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                placeholder="20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proficiency_level">Proficiency Level *</Label>
              <Select
                value={formData.proficiency_level}
                onValueChange={(value) =>
                  handleChange("proficiency_level", value)
                }
              >
                <SelectTrigger id="proficiency_level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission_type">Mission Type *</Label>
              <Select
                value={formData.mission_type}
                onValueChange={(value) => handleChange("mission_type", value)}
              >
                <SelectTrigger id="mission_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sdg">Sustainable Development Goal *</Label>
            <Select
              value={formData.sdg.toString()}
              onValueChange={(value) => handleChange("sdg", parseInt(value))}
            >
              <SelectTrigger id="sdg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - No Poverty</SelectItem>
                <SelectItem value="2">2 - Zero Hunger</SelectItem>
                <SelectItem value="3">
                  3 - Good Health and Well-being
                </SelectItem>
                <SelectItem value="4">4 - Quality Education</SelectItem>
                <SelectItem value="5">5 - Gender Equality</SelectItem>
                <SelectItem value="6">
                  6 - Clean Water and Sanitation
                </SelectItem>
                <SelectItem value="7">
                  7 - Affordable and Clean Energy
                </SelectItem>
                <SelectItem value="8">
                  8 - Decent Work and Economic Growth
                </SelectItem>
                <SelectItem value="9">
                  9 - Industry, Innovation and Infrastructure
                </SelectItem>
                <SelectItem value="10">10 - Reduced Inequalities</SelectItem>
                <SelectItem value="11">
                  11 - Sustainable Cities and Communities
                </SelectItem>
                <SelectItem value="12">
                  12 - Responsible Consumption and Production
                </SelectItem>
                <SelectItem value="13">13 - Climate Action</SelectItem>
                <SelectItem value="14">14 - Life Below Water</SelectItem>
                <SelectItem value="15">15 - Life on Land</SelectItem>
                <SelectItem value="16">
                  16 - Peace, Justice and Strong Institutions
                </SelectItem>
                <SelectItem value="17">
                  17 - Partnerships for the Goals
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Mission
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

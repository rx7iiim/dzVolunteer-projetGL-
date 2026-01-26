"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  Loader2,
  ChevronLeft,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

// --- Configuration ---
const APIURL = process.env.NEXT_PUBLIC_API_URL;

// --- Types ---
interface Participant {
  id: string;
  volunteer_id: string;
  volunteer_name: string;
  volunteer_email: string;
  volunteer_phone: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  application_message: string;
  actual_hours_worked: number | null;
  applied_at: string;
  review_notes: string | null;
  organization_rating: number | null;
}

interface MissionStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
  cancelled: number;
}

interface MissionData {
  mission_id: string;
  mission_title: string;
  volunteers_needed: number;
  volunteers_approved: number;
  participants: Participant[];
  statistics: MissionStats;
}

interface MissionParticipantsManagerProps {
  missionId: string;
}

export default function MissionParticipantsManager({
  missionId,
}: MissionParticipantsManagerProps) {
  const router = useRouter();
  const { authFetch, loading, error } = useAuthFetch();

  // Data State
  const [data, setData] = useState<MissionData | null>(null);

  // UI State
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Form State for Updates
  const [updateForm, setUpdateForm] = useState({
    status: "",
    review_notes: "",
    actual_hours_worked: "",
    organization_rating: "",
  });

  // --- 1. Fetch Data (GET) ---
  const fetchParticipants = useCallback(async () => {
    try {
      // API Call: GET /api/missions/{mission_id}/participants/
      const result = await authFetch(
        `${APIURL}/api/missions/${missionId}/participants/`,
      );
      if (result) {
        setData(result);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    }
  }, [authFetch, missionId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // --- 2. Update Participant (PATCH) ---
  const handleUpdateSubmit = async () => {
    if (!selectedParticipant) return;
    setUpdateLoading(true);

    try {
      const payload: any = {
        status: updateForm.status,
        review_notes: updateForm.review_notes,
      };

      // Only include hours/rating if status is completed
      if (updateForm.status === "completed") {
        if (updateForm.actual_hours_worked)
          payload.actual_hours_worked = parseFloat(
            updateForm.actual_hours_worked,
          );
        if (updateForm.organization_rating)
          payload.organization_rating = parseInt(
            updateForm.organization_rating,
          );
      }

      // API Call: PATCH /api/missions/{id}/participants/{p_id}/update/
      await authFetch(
        `${APIURL}/api/missions/${missionId}/participants/${selectedParticipant.id}/update/`,
        {
          method: "PATCH",
          body: payload,
        },
      );

      // Refresh list and close modal
      await fetchParticipants();
      setIsEditOpen(false);
      setSelectedParticipant(null);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  // --- Helpers ---
  const openEditModal = (participant: Participant) => {
    setSelectedParticipant(participant);
    setUpdateForm({
      status: participant.status,
      review_notes: participant.review_notes || "",
      actual_hours_worked: participant.actual_hours_worked?.toString() || "",
      organization_rating: participant.organization_rating?.toString() || "",
    });
    setIsEditOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Filtering Logic
  const filteredParticipants = data?.participants.filter((p) => {
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesSearch =
      p.volunteer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.volunteer_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-destructive">
        <AlertCircle className="h-10 w-10" />
        <p>{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-fit -ml-2 text-muted-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Missions
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {data?.mission_title}
            </h1>
            <p className="text-muted-foreground">
              Manage applications and track volunteer hours.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="font-semibold">{data?.volunteers_approved}</span>
            <span className="text-muted-foreground">
              / {data?.volunteers_needed} Approved
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Pending"
          count={data?.statistics.pending || 0}
          icon={Clock}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <StatsCard
          label="Accepted"
          count={data?.statistics.accepted || 0}
          icon={CheckCircle2}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatsCard
          label="Rejected"
          count={data?.statistics.rejected || 0}
          icon={XCircle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatsCard
          label="Completed"
          count={data?.statistics.completed || 0}
          icon={Star}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Filters & Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search volunteers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="capitalize">
                  {filterStatus === "all" ? "All Status" : filterStatus}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[
                "all",
                "pending",
                "accepted",
                "completed",
                "rejected",
                "cancelled",
              ].map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Participants List */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        {filteredParticipants && filteredParticipants.length > 0 ? (
          <div className="divide-y">
            {filteredParticipants.map((p) => (
              <div
                key={p.id}
                className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-slate-50 transition-colors"
              >
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {p.volunteer_name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`capitalize ${getStatusColor(p.status)}`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {p.volunteer_email} • {p.volunteer_phone}
                  </div>
                  <p className="text-sm mt-2 text-slate-700 bg-slate-50 p-2 rounded line-clamp-2 italic">
                    "{p.application_message}"
                  </p>
                </div>

                {/* Meta & Actions */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground whitespace-nowrap">
                  <div className="hidden md:flex flex-col items-end">
                    <span>
                      Applied: {new Date(p.applied_at).toLocaleDateString()}
                    </span>
                    {p.status === "completed" && (
                      <span className="text-blue-600 font-medium">
                        Worked: {p.actual_hours_worked}h
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditModal(p)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No participants found matching your filters.
          </div>
        )}
      </div>

      {/* --- Edit Modal --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Application</DialogTitle>
            <DialogDescription>
              Update status for {selectedParticipant?.volunteer_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(val) =>
                  setUpdateForm({ ...updateForm, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Review Notes / Feedback</Label>
              <Textarea
                placeholder="Internal notes or feedback..."
                value={updateForm.review_notes}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, review_notes: e.target.value })
                }
              />
            </div>

            {/* Conditional Fields for Completed Status */}
            {updateForm.status === "completed" && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label>Actual Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={updateForm.actual_hours_worked}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        actual_hours_worked: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Select
                    value={updateForm.organization_rating}
                    onValueChange={(val) =>
                      setUpdateForm({ ...updateForm, organization_rating: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Stars
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={updateLoading}>
              {updateLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple Subcomponent for Stats
function StatsCard({ label, count, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold mt-1">{count}</h3>
        </div>
        <div className={`p-3 rounded-full ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
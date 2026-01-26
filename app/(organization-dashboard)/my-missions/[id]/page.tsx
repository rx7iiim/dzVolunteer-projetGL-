"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  UserCheck,
  UserX,
  Search,
  Filter,
  Globe,
  Plus,
  Star,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import the Add SDG Modal
import AddSdgToMissionModal from "./AddSdgToMissionModal";
import RateVolunteerModal from "./RateVolunteerModal";
import RatingStatusModal from "./RatingStatusModal";

// Configuration
const APIURL = process.env.NEXT_PUBLIC_API_URL;

// Interfaces (same as in the main applicants page)
interface Participant {
  id: string;
  volunteer_id: string;
  volunteer_name: string;
  volunteer_email: string;
  volunteer_phone: string;
  mission_title: string;
  status: string;
  application_message: string;
  actual_hours_worked: number | null;
  applied_at: string;
  status_changed_at: string;
  review_notes: string;
  volunteer_rating: number | null;
  organization_rating: number | null;
}

interface MissionParticipantsResponse {
  mission_id: string;
  mission_title: string;
  sdg_title: string;
  sdg_number: number;
  volunteers_needed: number;
  volunteers_approved: number;
  participants: Participant[];
  total_participants: number;
  statistics: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
    cancelled: number;
  };
}

export default function MissionParticipantsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const missionId = params.id;

  const [missionData, setMissionData] =
    useState<MissionParticipantsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingParticipantId, setUpdatingParticipantId] = useState<
    string | null
  >(null);

  // State for Add SDG Modal
  const [isAddSdgModalOpen, setIsAddSdgModalOpen] = useState(false);

  // State for Rate Volunteer Modal
  const [isRateVolunteerModalOpen, setIsRateVolunteerModalOpen] =
    useState(false);
  const [selectedParticipationId, setSelectedParticipationId] = useState<
    string | null
  >(null);
  const [selectedVolunteerName, setSelectedVolunteerName] =
    useState<string>("");

  // State for Rating Status Modal
  const [isRatingStatusModalOpen, setIsRatingStatusModalOpen] = useState(false);
  const [selectedRatingParticipationId, setSelectedRatingParticipationId] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get access token
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No access token found");
        }

        const response = await fetch(
          `${APIURL}/api/missions/${missionId}/participants/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              errorData.error ||
              response.statusText ||
              "Request failed",
          );
        }

        const data = await response.json();
        setMissionData(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to load participants", err);
      } finally {
        setLoading(false);
      }
    };

    if (missionId) {
      fetchParticipants();
    }
  }, [missionId]);

  // Update participant status (accept, reject, completed, etc.)
  const updateParticipantStatus = async (
    participantId: string,
    status: "pending" | "accepted" | "rejected" | "completed" | "cancelled",
    reviewNotes?: string,
  ) => {
    try {
      setUpdatingParticipantId(participantId);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/missions/${missionId}/participants/${participantId}/update/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            review_notes: reviewNotes,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            errorData.error ||
            response.statusText ||
            "Request failed",
        );
      }

      const result = await response.json();
      const updatedParticipation = result.participation as Participant;

      // Update local state: participants, volunteers_approved, and statistics
      setMissionData((prev) => {
        if (!prev) return prev;

        const participants = prev.participants.map((p) =>
          p.id === participantId ? { ...p, ...updatedParticipation } : p,
        );

        const stats = participants.reduce(
          (acc, p) => {
            acc.total += 1;
            const s = p.status.toLowerCase();
            if (s === "pending") acc.pending += 1;
            if (s === "accepted") acc.accepted += 1;
            if (s === "rejected") acc.rejected += 1;
            if (s === "completed") acc.completed += 1;
            if (s === "cancelled") acc.cancelled += 1;
            return acc;
          },
          {
            total: 0,
            pending: 0,
            accepted: 0,
            rejected: 0,
            completed: 0,
            cancelled: 0,
          },
        );

        const volunteersApproved = participants.filter(
          (p) => p.status.toLowerCase() === "accepted",
        ).length;

        return {
          ...prev,
          participants,
          statistics: stats,
          volunteers_approved: volunteersApproved,
        };
      });
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to update participant status", err);
    } finally {
      setUpdatingParticipantId(null);
    }
  };

  // Function to refresh mission data after adding SDG
  const refreshMissionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get access token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/missions/${missionId}/participants/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            errorData.error ||
            response.statusText ||
            "Request failed",
        );
      }

      const data = await response.json();
      setMissionData(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to refresh mission data", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to open rating modal
  const openRateVolunteerModal = (
    participationId: string,
    volunteerName: string,
  ) => {
    setSelectedParticipationId(participationId);
    setSelectedVolunteerName(volunteerName);
    setIsRateVolunteerModalOpen(true);
  };

  // Function to open rating status modal
  const openRatingStatusModal = (participationId: string) => {
    setSelectedRatingParticipationId(participationId);
    setIsRatingStatusModalOpen(true);
  };

  // Filter participants based on status and search term
  const filteredParticipants =
    missionData?.participants.filter((participant) => {
      const matchesStatus =
        filterStatus === "all" || participant.status === filterStatus;
      const matchesSearch =
        participant.volunteer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        participant.volunteer_email
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    }) || [];

  // Helper to get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2 mb-6">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
        <Button onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Missions
        </Button>
      </div>
    );
  }

  if (!missionData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Mission not found</h3>
          <p className="text-muted-foreground mb-4">
            The mission you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Missions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Back button and header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Missions
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {missionData.mission_title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              Manage participants for this mission
            </p>
            {missionData.sdg_number && missionData.sdg_title && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                SDG {missionData.sdg_number}: {missionData.sdg_title}
              </Badge>
            )}
          </div>
        </div>

        {/* Add SDG button */}
        <Button
          variant="outline"
          onClick={() => setIsAddSdgModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add SDG
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border border-slate-200">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {missionData.statistics.total}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-700">
              {missionData.statistics.accepted}
            </div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-700">
              {missionData.statistics.pending}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-700">
              {missionData.statistics.rejected}
            </div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-700">
              {missionData.statistics.completed}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gray-50">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-gray-700">
              {missionData.statistics.cancelled}
            </div>
            <div className="text-xs text-muted-foreground">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Participants</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No participants found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "There are no participants for this mission yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {participant.volunteer_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">
                              {participant.volunteer_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {participant.application_message.substring(0, 50)}
                              {participant.application_message.length > 50
                                ? "..."
                                : ""}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusVariant(participant.status)}
                        >
                          {participant.status.charAt(0).toUpperCase() +
                            participant.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {participant.volunteer_email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {participant.volunteer_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(participant.applied_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {participant.actual_hours_worked !== null
                          ? `${participant.actual_hours_worked} hrs`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap gap-2">
                            {participant.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    updatingParticipantId === participant.id
                                  }
                                  onClick={() =>
                                    updateParticipantStatus(
                                      participant.id,
                                      "accepted",
                                    )
                                  }
                                >
                                  {updatingParticipantId === participant.id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <UserCheck className="h-3 w-3 mr-1" />
                                  )}
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    updatingParticipantId === participant.id
                                  }
                                  onClick={() =>
                                    updateParticipantStatus(
                                      participant.id,
                                      "rejected",
                                    )
                                  }
                                >
                                  {updatingParticipantId === participant.id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <UserX className="h-3 w-3 mr-1" />
                                  )}
                                  Reject
                                </Button>
                              </>
                            )}

                            {participant.status === "completed" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openRateVolunteerModal(
                                      participant.id,
                                      participant.volunteer_name,
                                    )
                                  }
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Rate Volunteer
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openRatingStatusModal(participant.id)
                                  }
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  View Rating Status
                                </Button>
                              </>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add SDG to Mission Modal */}
      <AddSdgToMissionModal
        isOpen={isAddSdgModalOpen}
        onClose={() => setIsAddSdgModalOpen(false)}
        missionId={missionId}
        onSuccess={refreshMissionData}
      />

      {/* Rate Volunteer Modal */}
      <RateVolunteerModal
        isOpen={isRateVolunteerModalOpen}
        onClose={() => setIsRateVolunteerModalOpen(false)}
        participationId={selectedParticipationId || ""}
        volunteerName={selectedVolunteerName}
        onSuccess={refreshMissionData}
      />

      {/* Rating Status Modal */}
      <RatingStatusModal
        isOpen={isRatingStatusModalOpen}
        onClose={() => setIsRatingStatusModalOpen(false)}
        participationId={selectedRatingParticipationId || ""}
      />
    </div>
  );
}

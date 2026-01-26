"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Award,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface VolunteerSkill {
  id: string;
  volunteer_name: string;
  skill_name: string;
  skill_level: string;
  is_verified: boolean;
  date_added: string;
  verification_status: string;
}

export default function AllSkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<VolunteerSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${APIURL}/api/volunteer-skills/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || "Failed to fetch skills",
        );
      }

      const data = await response.json();
      const skillsList = Array.isArray(data) ? data : data.results || [];
      setSkills(skillsList);
    } catch (err: any) {
      console.error("Error fetching skills:", err);
      setError(err.message || "Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSkills();
  }, [fetchAllSkills]);

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSkills = skills.filter(
    (skill) =>
      skill.volunteer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.skill_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          All Volunteer Skills
        </h1>
        <p className="text-muted-foreground">
          View and manage all volunteer skills across the platform.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Volunteer Skills</CardTitle>
            <CardDescription>All skills across all volunteers</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search skills..."
              className="pl-8 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredSkills.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No skills found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {skill.volunteer_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          {skill.skill_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{skill.skill_level}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(skill.date_added).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {skill.is_verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusVariant(
                            skill.verification_status,
                          )}
                        >
                          {skill.verification_status === "pending" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {skill.verification_status === "verified" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {skill.verification_status === "rejected" && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {skill.verification_status
                            ? skill.verification_status
                                .charAt(0)
                                .toUpperCase() +
                              skill.verification_status.slice(1)
                            : "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/direct-skill-verification?skillId=${skill.id}`,
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
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
  User,
  Briefcase,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface SkillRequirement {
  id: string;
  volunteer_name: string;
  mission_title: string;
  required_skills: string[];
  possessed_skills: string[];
  missing_skills: string[];
  status: string;
}

export default function SkillRequirementsPage() {
  const [requirements, setRequirements] = useState<SkillRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/check_requirements/`,
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
            "Failed to fetch skill requirements",
        );
      }

      const data = await response.json();
      const requirementsList = Array.isArray(data) ? data : data.results || [];
      setRequirements(requirementsList);
    } catch (err: any) {
      console.error("Error fetching skill requirements:", err);
      setError(err.message || "Failed to fetch skill requirements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "bg-green-100 text-green-800";
      case "missing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequirements = requirements.filter(
    (r) =>
      r.volunteer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mission_title?.toLowerCase().includes(searchQuery.toLowerCase()),
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
          Skill Requirements
        </h1>
        <p className="text-muted-foreground">
          Check skill requirements for volunteers applying to missions.
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
            <CardTitle>Skill Requirements Check</CardTitle>
            <CardDescription>
              See which skills volunteers are missing for specific missions
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search requirements..."
                className="pl-8 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={fetchRequirements} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequirements.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No skill requirements found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Mission</TableHead>
                    <TableHead>Required Skills</TableHead>
                    <TableHead>Possessed Skills</TableHead>
                    <TableHead>Missing Skills</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {req.volunteer_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {req.mission_title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {req.required_skills?.map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {req.possessed_skills?.map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-green-100 text-green-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {req.missing_skills?.map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-red-100 text-red-800"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusVariant(req.status)}>
                          {req.status === "complete" ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Missing
                            </>
                          )}
                        </Badge>
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

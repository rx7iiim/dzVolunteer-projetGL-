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
  Lightbulb,
  User,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface SkillSuggestion {
  id: string;
  volunteer_name: string;
  suggested_skill: string;
  reason: string;
  confidence: number;
  missions_available: number;
}

export default function SkillSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/suggestions/`,
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
            "Failed to fetch skill suggestions",
        );
      }

      const data = await response.json();
      const suggestionsList = Array.isArray(data) ? data : data.results || [];
      setSuggestions(suggestionsList);
    } catch (err: any) {
      console.error("Error fetching skill suggestions:", err);
      setError(err.message || "Failed to fetch skill suggestions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.volunteer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.suggested_skill?.toLowerCase().includes(searchQuery.toLowerCase()),
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
        <h1 className="text-3xl font-bold tracking-tight">Skill Suggestions</h1>
        <p className="text-muted-foreground">
          View skill suggestions for volunteers based on mission requirements.
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
            <CardTitle>Skill Suggestions</CardTitle>
            <CardDescription>
              Suggestions for skills volunteers should acquire
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search suggestions..."
                className="pl-8 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={fetchSuggestions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No skill suggestions found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Suggested Skill</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Available Missions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuggestions.map((suggestion) => (
                    <TableRow key={suggestion.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {suggestion.volunteer_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-muted-foreground" />
                          {suggestion.suggested_skill}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {suggestion.reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>{suggestion.confidence}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {suggestion.missions_available} missions
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

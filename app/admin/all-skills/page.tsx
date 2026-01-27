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
  Plus,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Category {
  id: string;
  name: string;
}

interface CreateSkillPayload {
  name: string;
  description: string;
  category: string;
  verification_requirement: string;
}

interface CreateCategoryPayload {
  name: string;
  description: string;
}

export default function AllSkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<VolunteerSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create skill modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories] = useState<Category[]>([
    {
      id: "11aa05f0-4e99-4325-aea5-1c7b68cd3745",
      name: "Construction & Building",
    },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<CreateSkillPayload>({
    name: "",
    description: "",
    category: "11aa05f0-4e99-4325-aea5-1c7b68cd3745",
    verification_requirement: "document",
  });

  // Create category modal state
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [createCategoryError, setCreateCategoryError] = useState<string | null>(
    null,
  );
  const [newCategory, setNewCategory] = useState<CreateCategoryPayload>({
    name: "",
    description: "",
  });

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

  // Create a new skill
  const createSkill = async () => {
    if (!newSkill.name.trim()) {
      setCreateError("Skill name is required");
      return;
    }
    if (!newSkill.category) {
      setCreateError("Please select a category");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      console.log("[createSkill] Creating skill with payload:", newSkill);

      const response = await fetch(`${APIURL}/api/skills/skills/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSkill),
      });

      console.log("[createSkill] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[createSkill] Error response:", errorData);
        throw new Error(
          errorData.detail ||
            errorData.error ||
            `Failed to create skill (${response.status})`,
        );
      }

      const createdSkill = await response.json();
      console.log("[createSkill] Skill created successfully:", createdSkill);

      // Reset form and close modal
      setNewSkill({
        name: "",
        description: "",
        category: "11aa05f0-4e99-4325-aea5-1c7b68cd3745",
        verification_requirement: "document",
      });
      setIsCreateModalOpen(false);

      // Refresh the skills list
      fetchAllSkills();
    } catch (err: any) {
      console.error("[createSkill] Error:", err);
      setCreateError(err.message || "Failed to create skill");
    } finally {
      setIsCreating(false);
    }
  };

  // Create a new category
  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      setCreateCategoryError("Category name is required");
      return;
    }

    setIsCreatingCategory(true);
    setCreateCategoryError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      console.log(
        "[createCategory] Creating category with payload:",
        newCategory,
      );

      const response = await fetch(`${APIURL}/api/skills/skill-categories/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      console.log("[createCategory] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[createCategory] Error response:", errorData);
        throw new Error(
          errorData.detail ||
            errorData.error ||
            `Failed to create category (${response.status})`,
        );
      }

      const createdCategory = await response.json();
      console.log(
        "[createCategory] Category created successfully:",
        createdCategory,
      );

      // Reset form and close modal
      setNewCategory({
        name: "",
        description: "",
      });
      setIsCreateCategoryModalOpen(false);
    } catch (err: any) {
      console.error("[createCategory] Error:", err);
      setCreateCategoryError(err.message || "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

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
          <div className="flex items-center gap-3">
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

            {/* Create Skill Button */}
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Skill
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Skill</DialogTitle>
                  <DialogDescription>
                    Add a new skill to the platform that volunteers can add to
                    their profiles.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {createError && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {createError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="skill-name">Skill Name *</Label>
                    <Input
                      id="skill-name"
                      placeholder="e.g. Construction Project Management"
                      value={newSkill.name}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skill-description">Description</Label>
                    <Textarea
                      id="skill-description"
                      placeholder="e.g. Planning, coordinating, and supervising construction projects"
                      value={newSkill.description}
                      onChange={(e) =>
                        setNewSkill({
                          ...newSkill,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skill-category">Category *</Label>
                    <Select
                      value={newSkill.category}
                      onValueChange={(value) =>
                        setNewSkill({ ...newSkill, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-requirement">
                      Verification Requirement
                    </Label>
                    <Select
                      value={newSkill.verification_requirement}
                      onValueChange={(value) =>
                        setNewSkill({
                          ...newSkill,
                          verification_requirement: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">
                          Document Verification
                        </SelectItem>
                        <SelectItem value="self_declared">
                          Self Declared
                        </SelectItem>
                        <SelectItem value="test">Test/Assessment</SelectItem>
                        <SelectItem value="reference">
                          Reference Check
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createSkill} disabled={isCreating}>
                    {isCreating && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create Skill
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Create Category Button */}
            <Dialog
              open={isCreateCategoryModalOpen}
              onOpenChange={setIsCreateCategoryModalOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>
                    Add a new skill category to organize skills on the platform.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {createCategoryError && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {createCategoryError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name *</Label>
                    <Input
                      id="category-name"
                      placeholder="e.g. Leadership & Management"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category-description">Description</Label>
                    <Textarea
                      id="category-description"
                      placeholder="e.g. Leadership, team management, and organizational skills"
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateCategoryModalOpen(false)}
                    disabled={isCreatingCategory}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createCategory}
                    disabled={isCreatingCategory}
                  >
                    {isCreatingCategory && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

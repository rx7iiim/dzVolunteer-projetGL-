"use client";

import { useState, useEffect } from "react";
import { Plus, User, Mail, Briefcase, Loader2, RefreshCw } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Custom Skill Components
import SkillsCard from "../skills/skillscard";
import AddVolunteerSkillComponent from "../skills/AddVolunteerSkillComponent";
import EditDeleteVolunteerSkillComponent from "../skills/EditDeleteVolunteerSkillComponent";
import RequestVerificationModal from "../skills/RequestVerificationModal";
import VerificationRequestHistory from "../skills/VerificationRequestHistory";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function VolunteerProfilePage() {
  // --- State ---
  const [user, setUser] = useState<any>(null);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Visibility States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [verifyingSkillId, setVerifyingSkillId] = useState<string | null>(null);
  const [historySkillId, setHistorySkillId] = useState<string | null>(null);

  // --- 1. Load User Data & Skills ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user data");
        }
      }
    }
    fetchMySkills();
  }, []);

  // --- ENDPOINT: GET /api/volunteer-skills/ (List My Skills) ---
  const fetchMySkills = async () => {
    setLoading(true);
    try {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No authentication token found");
        setMySkills([]);
        return;
      }

      const response = await fetch(`${API_URL}/api/skills/volunteer-skills/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setMySkills(data.results || data);
      } else {
        if (response.status === 401) {
          console.error("Unauthorized: Session may have expired");
        }
        console.error("Failed to fetch skills:", response.statusText);
        setMySkills([]);
      }
    } catch (error) {
      console.error("Error fetching my skills", error);
      setMySkills([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleSkillAction = (action: string, skillId: string) => {
    if (action === "edit") setEditingSkillId(skillId);
    if (action === "request") setVerifyingSkillId(skillId);
    if (action === "history") setHistorySkillId(skillId);
  };

  const handleRefresh = () => {
    // 1. Refresh the list
    fetchMySkills();
    // 2. Close any open modals
    setIsAddOpen(false);
    setEditingSkillId(null);
    setVerifyingSkillId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-6 rounded-xl border shadow-sm">
          <Avatar className="h-20 w-20 border-2 border-primary/10">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {user?.name || "Guest User"}
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Skills Management Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">My Skills</h2>
              <Badge variant="secondary">{mySkills.length}</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={fetchMySkills}>
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Skill
              </Button>
            </div>
          </div>

          <Separator />

          {/* Skills Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : mySkills.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50">
              <p className="text-muted-foreground mb-4">
                You haven't added any skills yet.
              </p>
              <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                Get Started
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySkills.map((skillItem) => (
                <SkillsCard
                  key={skillItem.id}
                  skill={skillItem}
                  onEdit={() => handleSkillAction("edit", skillItem.id)}
                  onRequestVerification={() =>
                    handleSkillAction("request", skillItem.id)
                  }
                  onViewHistory={() =>
                    handleSkillAction("history", skillItem.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: Add Skill --- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <AddVolunteerSkillComponent
            onSuccess={handleRefresh}
            onClose={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: Edit Skill --- */}
      <Dialog
        open={!!editingSkillId}
        onOpenChange={(open) => !open && setEditingSkillId(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          {editingSkillId && (
            <EditDeleteVolunteerSkillComponent
              skillId={editingSkillId}
              onSuccess={handleRefresh}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- MODAL 3: Verify Skill --- */}
      <Dialog
        open={!!verifyingSkillId}
        onOpenChange={(open) => !open && setVerifyingSkillId(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          {verifyingSkillId && (
            <RequestVerificationModal
              skillId={verifyingSkillId}
              onSuccess={handleRefresh}
              onClose={() => setVerifyingSkillId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- MODAL 4: History --- */}
      <Dialog
        open={!!historySkillId}
        onOpenChange={(open) => !open && setHistorySkillId(null)}
      >
        <DialogContent className="sm:max-w-[700px]">
          {historySkillId && (
            <VerificationRequestHistory skillId={historySkillId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

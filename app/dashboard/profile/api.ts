import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { useEffect, useState } from "react";
export const useFiles = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    avatar: null as File | null, // Store file object for upload
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [skills, setSkills] = useState<VolunteerSkill[]>([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SystemSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [proficiencyLevel, setProficiencyLevel] = useState("intermediate");
  const [isSearching, setIsSearching] = useState(false);

  const [verifyingSkillId, setVerifyingSkillId] = useState<string | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchWithAuth = useFetchWithAuth();
  const fetchProfile = async () => {
    try {
      // Endpoint: GET /api/v1/accounts/me/
      const data = await fetchWithAuth("/v1/accounts/me/");
      if (data && data.user) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // We use FormData to handle potential file uploads (avatar)
      const formData = new FormData();
      formData.append("first_name", editFormData.first_name);
      formData.append("last_name", editFormData.last_name);
      formData.append("phone_number", editFormData.phone_number);

      if (editFormData.avatar) {
        formData.append("avatar", editFormData.avatar);
      }

      // Endpoint: PATCH /api/v1/accounts/me/update/
      // Note: fetchWithAuth handles content-type for FormData automatically
      const data = await fetchWithAuth("/v1/accounts/me/update/", {
        method: "PATCH",
        body: formData,
      });

      if (data && data.user) {
        setProfile(data.user);
        setEditingProfile(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFormData((prev) => ({ ...prev, avatar: file }));
      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  // --- API Actions: Skills ---

  const fetchSkills = async () => {
    try {
      const data = await fetchWithAuth("/volunteer-skills/");
      setSkills(data.results || []);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const searchSystemSkills = async (query: string) => {
    setIsSearching(true);
    try {
      const data = await fetchWithAuth(
        `/skills/search/?q=${encodeURIComponent(query)}`
      );
      setSearchResults(data || []);
    } catch (error) {
      console.error("Failed to search skills:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;

    try {
      await fetchWithAuth("/volunteer-skills/", {
        method: "POST",
        body: JSON.stringify({
          skill_id: selectedSkillId,
          proficiency_level: proficiencyLevel,
        }),
      });

      setIsAddingSkill(false);
      setSkillSearchQuery("");
      setSelectedSkillId(null);
      fetchSkills();
    } catch (error) {
      alert("Failed to add skill. It may already exist in your profile.");
    }
  };

  const handleVerifySkill = async () => {
    if (!verifyingSkillId || !verificationFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", verificationFile);

    try {
      await fetchWithAuth(
        `/volunteer-skills/${verifyingSkillId}/request-verification/`,
        {
          method: "POST",
          body: formData,
        }
      );

      setVerifyingSkillId(null);
      setVerificationFile(null);
      fetchSkills();
      alert("Verification requested successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to request verification.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    fetchProfile,
    handleAddSkill,
    handleAvatarChange,
    handleSaveProfile,
    searchSystemSkills,
    handleVerifySkill,
    fetchSkills,
  };
};

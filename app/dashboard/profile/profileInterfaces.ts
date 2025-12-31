// --- Types ---

// Profile Types
interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_type: string;
  phone_number: string;
  is_verified: boolean;
  is_active: boolean;
  avatar: string | null;
  date_joined: string;
  last_login: string;
  total_rating: number;
  rating_count: number;
  average_rating: number;
}

// Skill Types
interface SkillCategory {
  id: string;
  name: string;
}

interface SystemSkill {
  id: string;
  name: string;
  category?: SkillCategory;
  verification_requirement_display?: string;
}

interface VolunteerSkill {
  id: string;
  skill: SystemSkill;
  proficiency_level: string;
  proficiency_level_display: string;
  verification_status: "verified" | "pending" | "rejected" | "unverified";
  is_primary: boolean;
}

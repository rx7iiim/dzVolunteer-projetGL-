// lib/api/missions.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Mission {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  organization_name: string;
  sdg_title: string;
  sdg_number: number;
  location: string;
  volunteers_needed: number;
  volunteers_approved: number;
  status: string;
  estimated_total_hours: number;
}

interface ApplicationRequest {
  application_message?: string;
}

interface ApplicationResponse {
  message: string;
  participation: {
    id: string;
    mission_id: string;
    mission_title: string;
    status: string;
    applied_at: string;
  };
}

interface RequirementSummary {
  mission_id: string;
  mission_title: string;
  requirements_summary: {
    meets_proficiency: boolean;
    missing_skills: string[];
    meets_skills: string[];
    volunteer_proficiency: string;
    required_proficiency: string;
  };
  already_applied: boolean;
  application_status: string | null;
}

class MissionService {
  private getAuthHeaders(): { Authorization: string } {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getAcceptedMissions(): Promise<{ data: Mission[] }> {
    try {
      const response = await axios.get<Mission[]>(
        `${API_BASE_URL}/api/missions/accepted/`,
        { headers: this.getAuthHeaders() },
      );
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Handle the case where user has no accepted missions
        return error.response;
      }
      throw error;
    }
  }

  async getCompletedMissions(): Promise<{ data: Mission[] }> {
    try {
      const response = await axios.get<Mission[]>(
        `${API_BASE_URL}/api/missions/completed/`,
        { headers: this.getAuthHeaders() },
      );
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Handle the case where user has no completed missions
        return error.response;
      }
      throw error;
    }
  }

  async getFollowingMissions(): Promise<{ data: Mission[] }> {
    try {
      const response = await axios.get<Mission[]>(
        `${API_BASE_URL}/api/missions/following/`,
        { headers: this.getAuthHeaders() },
      );
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Handle the case where user is not following any organizations with missions
        return error.response;
      }
      throw error;
    }
  }

  async applyToMission(
    missionId: string,
    applicationData: ApplicationRequest,
  ): Promise<{ data: ApplicationResponse }> {
    const response = await axios.post<ApplicationResponse>(
      `${API_BASE_URL}/api/missions/${missionId}/apply/`,
      applicationData,
      {
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  }

  async checkMissionRequirements(
    missionId: string,
  ): Promise<{ data: RequirementSummary }> {
    const response = await axios.get<RequirementSummary>(
      `${API_BASE_URL}/api/missions/${missionId}/check-requirements/`,
      { headers: this.getAuthHeaders() },
    );
    return response;
  }
}

export const missionService = new MissionService();

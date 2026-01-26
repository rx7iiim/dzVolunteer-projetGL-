// lib/api/organization-missions.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

interface Applicant {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  application_message: string;
  applied_at: string;
  status: "pending" | "accepted" | "rejected";
  user_avatar?: string;
}

interface ParticipationUpdateRequest {
  status: "accepted" | "rejected";
}

class OrganizationMissionService {
  private getAuthHeaders(): { Authorization: string } {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      Authorization: `Bearer ${token}`
    };
  }

  async getMissionById(missionId: string): Promise<{ data: Mission }> {
    const response = await axios.get<Mission>(
      `${API_BASE_URL}/api/missions/${missionId}/`,
      { headers: this.getAuthHeaders() }
    );
    return response;
  }

  async getApplicantsForMission(missionId: string): Promise<{ data: Applicant[] }> {
    const response = await axios.get<Applicant[]>(
      `${API_BASE_URL}/api/missions/${missionId}/applicants/`,
      { headers: this.getAuthHeaders() }
    );
    return response;
  }

  async updateApplicantStatus(missionId: string, applicantId: string, status: "accepted" | "rejected"): Promise<{ data: any }> {
    const response = await axios.patch(
      `${API_BASE_URL}/api/missions/${missionId}/applicants/${applicantId}/update-status/`,
      { status },
      { headers: this.getAuthHeaders() }
    );
    return response;
  }
}

export const organizationMissionService = new OrganizationMissionService();
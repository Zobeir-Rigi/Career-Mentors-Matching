import { api } from "./api";

export interface MentorProfilePayload {
  currentJobTitle: string;
  bio: string;
  capacity: number;
  openToRemote: boolean;
  region: string;
  meetingCadence: string;
  meetingStructure: string;
  linkedinURL?: string;
  scheduleURL?: string;
  availability: string[];
  disciplines: string[];
  skills: string[];
  industries: string[];
}

export interface MentorProfileResponse {
  id: string;
  userId: string;
  currentJobTitle: string;
  bio: string;
  capacity: number;
  openToRemote: boolean;
  region: string;
  meetingCadence: string;
  meetingStructure: string;
  availability: string[];
  linkedinURL?: string;
  scheduleURL?: string;
  disciplines?: string[];
  skills?: string[];
  industries?: string[];
  isAcceptingMentees: boolean;
  approvalStatus: string;
  notifiedAdminAt: string | null;
  isProfileComplete: boolean;
  isMatchReady: boolean;

  user?: {
    id: string;
    fullName: string;
    email: string;
    linkedinURL?: string | null;
    scheduleURL?: string | null;
  };
  mentorDisciplines?: Array<{
    discipline?: { name: string };
    disciplineId?: string;
    name?: string;
  }>;
  mentorSkills?: Array<{
    skill?: { name: string };
    skillId?: string;
    name?: string;
  }>;
  mentorDomainIndustries?: Array<{
    industry?: { name: string };
    industryId?: string;
    name?: string;
  }>;
}

export async function upsertMentorProfile(
  data: MentorProfilePayload,
): Promise<MentorProfileResponse> {
  const response = await api.put<MentorProfileResponse>(
    "/mentors/profile",
    data,
  );
  return response.data;
}

export async function getMentorProfile(): Promise<MentorProfileResponse> {
  const response = await api.get<MentorProfileResponse>("/mentors/profile");
  return response.data;
}

export async function updateMentorProfile(
  data: Partial<MentorProfilePayload> & { isAcceptingMentees?: boolean },
): Promise<MentorProfileResponse> {
  const response = await api.patch<MentorProfileResponse>(
    "/mentors/profile",
    data,
  );
  return response.data;
}

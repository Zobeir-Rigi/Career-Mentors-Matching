import { api } from "./api";

export type MentorEngagementStatus =
  | "proposed-awaiting-acceptance"
  | "awaiting-booking"
  | "booked"
  | "confirmed-waiting"
  | "active";

export interface MentorDashboardMentee {
  id: string;
  fullName: string;
  currentJobTitle: string | null;
  bio: string | null;
  linkedinURL: string | null;
  focus: string | null;
  email: string | null;
}

export interface MentorDashboardCountdown {
  daysLeft: number | null;
  expiresAt: string | null;
}

export interface MentorDashboardEngagement {
  id: string;
  subStatus: MentorEngagementStatus;
  mentee: MentorDashboardMentee;
  countdown: MentorDashboardCountdown;
}

export interface MentorDashboardResponse {
  fullName: string;

  capacity: {
    filled: number;
    total: number;
    isAtCapacity: boolean;
  };

  isAcceptingMentees: boolean;

  engagements: MentorDashboardEngagement[];

  profileSummary: {
    disciplines: string[];
    bio: string;
  };
}

export async function getMentorDashboard(): Promise<MentorDashboardResponse> {
  const response = await api.get<MentorDashboardResponse>("/mentors/dashboard");

  return response.data;
}

export async function declineMentorEngagement(
  engagementId: string,
): Promise<void> {
  await api.patch(`/mentors/engagements/${engagementId}/decline`);
}

export async function confirmMentorEngagement(
  engagementId: string,
): Promise<void> {
  await api.patch(`/mentors/engagements/${engagementId}/confirm`);
}

export async function endMentorEngagement(engagementId: string): Promise<void> {
  await api.patch(`/mentors/engagements/${engagementId}/end`);
}

import { api } from "./api";

export type MenteeJourneyStage =
  | "incomplete"
  | "ready"
  | "match-proposed"
  | "chemistry-confirm"
  | "mentorship-active";

export type MenteeMatchSubStatus =
  | "proposed"
  | "awaiting-booking"
  | "booked"
  | "confirmed-waiting"
  | "active";

export interface MenteeDashboardCurrentMatch {
  id: string;

  subStatus: MenteeMatchSubStatus;

  mentor: {
    id: string;
    fullName: string;
    currentJobTitle: string | null;
    bio: string | null;
    linkedinURL: string | null;
    calendarLink: string | null;
    focusAreas: string[];
    email: string | null;
  };

  countdown: {
    daysLeft: number | null;
    expiresAt: string | null;
  };

  chemistryBookedAt: string | null;
}

export interface MenteeDashboardPastMatch {
  id: string;
  mentorName: string;
  focusAreas: string[];
  status: "COMPLETED" | "DECLINED";
  completedAt: string | null;
  declinedAt: string | null;
}

export interface MenteeDashboardResponse {
  fullName: string;
  journeyStage: MenteeJourneyStage;
  matchReady: boolean;
  goals: string[];

  currentMatch: MenteeDashboardCurrentMatch | null;

  pastMatches: MenteeDashboardPastMatch[];
}


export async function getMenteeDashboard() {
  const response = await api.get("/mentee-profile/dashboard");

  return response.data;
}

export async function acceptMenteeMatch(matchId: string): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/accept`);
}

export async function bookMenteeChemistry(matchId: string): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/book`);
}

export async function confirmMenteeMatch(matchId: string): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/confirm`);
}

export async function declineMenteeMatch(matchId: string): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/decline`);
}

export async function endMenteeMatch(matchId: string): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/end`);
}

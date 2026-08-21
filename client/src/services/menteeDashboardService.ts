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

export type MenteeCurrentMatchStatus =
  | "CHEMISTRY_PENDING"
  | "CHEMISTRY_CONFIRMED"
  | "MATCH_PENDING"
  | "ACTIVE";

export interface MenteeDashboardCurrentMatch {
  id: string;

  status: MenteeCurrentMatchStatus;

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

  checkIn: {
    menteeAgreed: boolean | null;
    mentorAgreed: boolean | null;
  };

  chemistryBookedAt: string | null;

  scheduledCheckIn: string | null;
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

export async function getMenteeDashboard(): Promise<MenteeDashboardResponse> {
  const response = await api.get<MenteeDashboardResponse>(
    "/mentee-profile/dashboard",
  );

  return response.data;
}

export async function bookMenteeChemistry(matchId: string): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/book`);
}

export async function respondToMenteeCheckIn(
  matchId: string,
  agreed: boolean,
): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/check-in`, {
    agreed,
  });
}

export async function declineMenteeMatch(matchId: string): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/decline`);
}

export async function endMenteeMatch(matchId: string): Promise<void> {
  await api.patch(`/mentee-profile/engagements/${matchId}/end`);
}

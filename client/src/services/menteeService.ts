import { api } from "./api";

export interface MenteeProfilePayload {
  currentJobTitle?: string;
  reasonsNote?: string;
  bio?: string;
  openToRemote?: boolean;
  region?: string;
  meetingCadence?: string;
  meetingStructure?: string;
  linkedinURL?: string;
  scheduleURL?: string;
  availability?: string[];
  disciplineGoals?: string[];
  wantedSkills?: string[];
  industries?: string[];
}

export interface MenteeProfileResponse {
  currentJobTitle?: string;
  reasonsNote?: string;
  bio?: string;

  openToRemote: boolean;
  region?: string;

  meetingCadence?: string;
  meetingStructure?: string;

  linkedinURL?: string;
  scheduleURL?: string;

  availability: string[];
  disciplineGoals: string[];
  wantedSkills: string[];
  industries: string[];

  matchReady: boolean;
}

export function isMenteeProfileResponse(
  profile: unknown,
): profile is MenteeProfileResponse {
  return (
    typeof profile === "object" &&
    profile !== null &&
    "matchReady" in profile &&
    typeof profile.matchReady === "boolean"
  );
}

export async function updateMenteeProfile(
  data: MenteeProfilePayload,
): Promise<MenteeProfileResponse> {
  const response = await api.put<MenteeProfileResponse>(
    "/mentee-profile",
    data,
  );

  return response.data;
}

export async function patchMenteeProfile(
  data: Partial<MenteeProfilePayload>,
): Promise<MenteeProfileResponse> {
  const response = await api.patch<MenteeProfileResponse>(
    "/mentee-profile",
    data,
  );

  return response.data;
}

export async function getMenteeProfile(): Promise<MenteeProfileResponse> {
  const response = await api.get<MenteeProfileResponse>("/mentee-profile");

  return response.data;
}

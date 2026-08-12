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

export async function updateMenteeProfile(
  data: MenteeProfilePayload,
) {
  const response = await api.put("/mentee-profile", data);

  return response.data;
}

export async function patchMenteeProfile(
  data: Partial<MenteeProfilePayload>,
) {
  const response = await api.patch("/mentee-profile", data);

  return response.data;
}

export async function getMenteeProfile() {
  const response = await api.get("/mentee-profile");

  return response.data;
}
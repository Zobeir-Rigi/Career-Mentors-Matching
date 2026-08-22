import { api } from "@/services/api";

import type { MentorRecommendation } from "@/types/matching";

export type MatchRequestResponse =
  | {
      status: "MATCHED";
      matchId: string;
    }
  | {
      status: "WAITING";
      matchId: null;
    }
  | {
      status: "RECOMMENDED";
      recommendation: MentorRecommendation;
    };

export interface ChemistryProposalResponse {
  status: "CHEMISTRY_PENDING";
  matchId: string;
}

export async function requestMentorMatch(): Promise<MatchRequestResponse> {
  const response = await api.post<MatchRequestResponse>("/matching/request");

  return response.data;
}

export async function getMentorRecommendations(): Promise<
  MentorRecommendation[]
> {
  const response = await api.post<MentorRecommendation[]>(
    "/matching/recommendations",
  );

  return response.data;
}

export async function proposeChemistry(
  mentorId: string,
): Promise<ChemistryProposalResponse> {
  const response = await api.post<ChemistryProposalResponse>(
    `/matching/chemistry/${mentorId}`,
  );

  return response.data;
}

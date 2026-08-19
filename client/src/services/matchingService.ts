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
    };

export async function requestMentorMatch(): Promise<MatchRequestResponse> {
  const response = await api.post<MatchRequestResponse>(
    "matching/request",
  );

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

export async function switchMentorProposal(
  mentorId: string,
): Promise<MatchRequestResponse> {
  const response = await api.patch<MatchRequestResponse>(
    `/matching/proposal/${mentorId}`,
  );

  return response.data;
}

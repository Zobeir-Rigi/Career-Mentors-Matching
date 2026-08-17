import { api } from "@/services/api";
import type { MentorRecommendation } from "@/types/matching";

export async function getMentorRecommendations(): Promise<
  MentorRecommendation[]
> {
  const response = await api.post<MentorRecommendation[]>(
    "matching/recommendations",
  );

  return response.data;
}

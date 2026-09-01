import { api } from "./api";

import type {
  GlobalMatchingData,
  MenteeData,
  MentorData,
} from "@/lib/context/AdminContext";

type MentorApprovalStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface AdminDirectoryParams {
  search?: string;
  page?: number;
  limit?: number;
}
export interface MentorsResponse {
  mentors: MentorData[];
  total: number;
  page: number;
  limit: number;
}

export interface MenteesResponse {
  mentees: MenteeData[];
  total: number;
  page: number;
  limit: number;
}

export function getMentees(params: AdminDirectoryParams = {}) {
  return api.get<MenteesResponse>("/admin/mentees", { params });
}

export function getMentors(params: AdminDirectoryParams = {}) {
  return api.get<MentorsResponse>("/admin/mentors", { params });
}

export function getOverview() {
  return api.get<GlobalMatchingData>("/admin/overview");
}

export function updateMentorApproval(
  mentorProfileId: string,
  approvalStatus: MentorApprovalStatus,
) {
  return api.patch(`/admin/mentors/${mentorProfileId}/approval`, {
    approvalStatus,
  });
}

import { createContext, useContext } from "react";

export interface WaitingMenteeData {
  id: string;
  fullName: string;
  email: string;
  goals: string[];
  waitingSince: string;
}

export interface GlobalMatchingData {
  volunteerMentors: number;
  openMenteePlaces: number;
  liveMatches: number;
  menteesWaiting: number;
  pendingMentors: number;
  waitingMentees: WaitingMenteeData[];
}

export interface MentorCapacity {
  filled: number;
  total: number;
  isFull: boolean;
}

export interface MatchedMenteeData {
  menteeProfileId: string;
  fullName: string;
  email: string;
  score: number;
}

export interface MentorData {
  mentorProfileId: string;

  fullName: string;
  email: string;

  currentJobTitle: string | null;
  approvalStatus: "PENDING" | "ACCEPTED" | "DECLINED";

  disciplines: string[];

  capacity: MentorCapacity;

  matchedMentees: MatchedMenteeData[];

  createdAt: string | null;
  region: string | null;
  bio: string | null;

  linkedinURL: string | null;

  availability: string[];

  matches: Match[];
}

export type MentorsData = MentorData[];

export interface CurrentMentorData {
  mentorProfileId: string;
  fullName: string;
  email: string;
}
export interface MenteeData {
  menteeProfileId: string;
  fullName: string;
  role: string;
  email: string;
  goals: string[];
  goalsNotes?: string;
  createdAt: string | null;
  region: string | null;
  bio?: string;
  links: string | null;
  availability: string[];
  matches: Match[];
  mentor: CurrentMentorData | null;
  status: string | null;
}

export type MenteesData = MenteeData[];
export type MenteesWaitingData = WaitingMenteeData[];

export interface Match {
  fullName: string;
  createdAt: string | null;
  status: string;
  proposedBy?: string;
  declinedAt?: string | null;
  declinedBy?: string;
  score?: number | string | null;
}

export interface StaffContextType {
  globalMatchingData: GlobalMatchingData | null;
  menteesWaitingData: MenteesWaitingData;
  mentorData: MentorData | null;
  mentorsData: MentorsData;
  mentorMatches: Match[];
  menteeData: MenteeData | null;
  menteesData: MenteesData;
  menteeMatches: Match[];
  isLoading: boolean;

  mentorTotal: number;
  menteeTotal: number;

  mentorSearch: string;
  menteeSearch: string;

  mentorPage: number;
  menteePage: number;

  mentorLimit: number;
  menteeLimit: number;

  setMentorSearch: (search: string) => void;
  setMenteeSearch: (search: string) => void;

  setMentorPage: (page: number) => void;
  setMenteePage: (page: number) => void;
  refetch: () => Promise<void>;
}

export const StaffContext = createContext<StaffContextType | undefined>(
  undefined,
);

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
};

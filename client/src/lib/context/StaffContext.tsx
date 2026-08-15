import { createContext, useContext } from "react";

export interface GlobalMatchingData {
    applicantsNumber: number;
    volunteerMentors: number;
    openMenteePlaces: number;
    liveMatches: number;
    menteesWaiting: number;
}
export interface MentorData {
    fullName: string;
    role: string;
    email: string;
    disciplines: string[];
    capacity: string;
    createdAt: string;
    region: string;
    bio: string;
    links: string;
    availability: string[];
    matches: Match[]
}

export type MentorsData = MentorData[];

export interface MenteeData {
    fullName: string;
    role: string;
    email: string;
    goals: string[];
    goalsNotes: string;
    createdAt: string;
    region: string;
    bio: string;
    links: string;
    availability: string[];
    matches: Match[];
}

export type MenteesData = MenteeData[];
export type MenteesWaitingData = MenteeData[];

export interface Match {
    fullName: string;
    createdAt: string;
    status: string;
    proposedBy: string;
    declinedAt?: string | null;
    declinedBy?: string;
    score?: string;
}

export interface StaffContextType {
    globalMatchingData: GlobalMatchingData | null;
    menteesWaitingData: MenteesWaitingData | null;
    mentorData: MentorData | null;
    mentorsData: MentorsData | [];
    mentorMatches: Match[];
    menteeData: MenteeData | null;
    menteesData: MenteesData | [];
    menteeMatches: Match[];
    isLoading: boolean;
    refetch: () => Promise<void>;
}

export const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const useStaff = () => {
    const context = useContext(StaffContext);
    if (!context) {
        throw new Error("useStaff must be used within a StaffProvider");
    }
    return context;
};
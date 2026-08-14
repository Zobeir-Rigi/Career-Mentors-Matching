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
    status: string;
    email: string;
    disciplines: string[];
    capacity: string;
    joined: string;
    location: string;
    bio: string;
    links: string;
    availability: string[];
}

export interface MenteeData {
    fullName: string;
    status: string;
    email: string;
    goals: string[];
    goalsNotes: string;
    joined: string;
    location: string;
    bio: string;
    links: string;
    availability: string[];
}

export type MenteesWaitingData = MenteeData[];

export interface Match {
    fullName: string;
    proposed: string;
    status: string;
    proposedBy: string;
    declined?: string;
    declinedBy?: string;
    score?: string;
}

export interface StaffContextType {
    globalMatchingData: GlobalMatchingData | null;
    menteesWaitingData: MenteesWaitingData | null;
    mentorData: MentorData | null;
    mentorMatches: Match[];
    menteeData: MenteeData | null;
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
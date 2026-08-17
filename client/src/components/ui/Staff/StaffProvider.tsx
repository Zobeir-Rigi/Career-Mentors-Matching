import React, { useState } from "react";
import {
    StaffContext,
    type GlobalMatchingData,
    type MenteesWaitingData,
    type MentorData,
    type MenteeData,
    type Match,
} from "./StaffContext";

// Mock data
const MOCK_GLOBAL_MATCHING_DATA: GlobalMatchingData = {
    applicantsNumber: 15,
    volunteerMentors: 68,
    openMenteePlaces: 23,
    liveMatches: 62,
    menteesWaiting: 4,
};

const MOCK_MENTEES_WAITING: MenteesWaitingData = [
    {
        fullName: "Ada Incomplete",
        status: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        joined: "22 Jul 2026",
        location: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
    },
    {
        fullName: "Chem Test",
        status: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        joined: "22 Jul 2026",
        location: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
    },
    {
        fullName: "Gate Test",
        status: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        joined: "22 Jul 2026",
        location: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
    },
    {
        fullName: "Gbenga History",
        status: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        joined: "22 Jul 2026",
        location: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
    },
];

const MOCK_MENTOR_DATA: MentorData = {
    fullName: "Ruta Radiya",
    status: "MENTOR",
    email: "ruta.radiya@mentor.example.dev",
    disciplines: ["Software Engineering", "Career Development", "Interview Prep"],
    capacity: "1/1",
    joined: "21 Jul 2026",
    location: "no region · open to remote",
    bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
    links: "None on file",
    availability: [],
};

const MOCK_MENTOR_MATCHES: Match[] = [
    {
        fullName: "Demo Mentee",
        proposed: "Proposed 21 Jul 2026",
        status: "ACTIVE",
        proposedBy: "AUTO_MATCH",
    },
];

const MOCK_MENTEE_DATA: MenteeData = {
    fullName: "Gbenga History",
    status: "MENTEE",
    email: "stage.history@example.dev",
    goals: ["Software Engineering", "Career Development", "Interview Prep"],
    goalsNotes: "Career-switcher aiming for a first tech role.",
    joined: "22 Jul 2026",
    location: "no region · open to remote",
    bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
    links: "None on file",
    availability: ["weekday evening", "weekend morning"],
};

const MOCK_MENTEE_MATCHES: Match[] = [
    {
        fullName: "Issy Geraghty",
        proposed: "22 Jul 2026 — ",
        status: "REJECTED",
        proposedBy: "Gbenga History",
        declined: "22 Jul 2026",
        declinedBy: "Gbenga History",
        score: "5",
    },
];

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [globalMatchingData] = useState<GlobalMatchingData | null>(MOCK_GLOBAL_MATCHING_DATA);
    const [menteesWaitingData] = useState<MenteesWaitingData | null>(MOCK_MENTEES_WAITING);
    const [mentorData] = useState<MentorData | null>(MOCK_MENTOR_DATA);
    const [mentorMatches] = useState<Match[]>(MOCK_MENTOR_MATCHES);
    const [menteeData] = useState<MenteeData | null>(MOCK_MENTEE_DATA);
    const [menteeMatches] = useState<Match[]>(MOCK_MENTEE_MATCHES);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const refetch = async () => {
        setIsLoading(true);
        try {
            // Future API Call replacing mock data
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StaffContext.Provider
            value={{
                globalMatchingData,
                menteesWaitingData,
                mentorData,
                mentorMatches,
                menteeData,
                menteeMatches,
                isLoading,
                refetch,
            }}
        >
            {children}
        </StaffContext.Provider>
    );
};
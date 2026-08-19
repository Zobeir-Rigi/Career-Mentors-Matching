import React, { useState, useEffect, } from "react";
import {
    StaffContext,
    type GlobalMatchingData,
    type MenteesWaitingData,
    type MentorData,
    type MenteeData,
    type MenteesData,
    type Match,
} from "@/lib/context/StaffContext";
import { getMentors } from "@/services/staffService";

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
        role: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        createdAt: "22 Jul 2026",
        region: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
        matches: [
            {
                fullName: "Issy Geraghty 1",
                createdAt: "22 Jul 2026 — ",
                status: "REJECTED",
                proposedBy: "Gbenga History",
                declinedAt: "22 Jul 2026",
                declinedBy: "Gbenga History",
                score: "5",
            },
        ],
    },
    {
        fullName: "Chem Test",
        role: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        createdAt: "22 Jul 2026",
        region: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
        matches: [
            {
                fullName: "Issy Geraghty 2",
                createdAt: "22 Jul 2026 — ",
                status: "REJECTED",
                proposedBy: "Gbenga History",
                declinedAt: "22 Jul 2026",
                declinedBy: "Gbenga History",
                score: "5",
            },
        ],
    },
    {
        fullName: "Gate Test",
        role: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        createdAt: "22 Jul 2026",
        region: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
        matches: [
            {
                fullName: "Issy Geraghty 1",
                createdAt: "22 Jul 2026 — ",
                status: "REJECTED",
                proposedBy: "Gbenga History",
                declinedAt: "22 Jul 2026",
                declinedBy: "Gbenga History",
                score: "5",
            },
        ],
    },
    {
        fullName: "Gbenga History",
        role: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        createdAt: "22 Jul 2026",
        region: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
        matches: [
            {
                fullName: "Issy Geraghty 1",
                createdAt: "22 Jul 2026 — ",
                status: "REJECTED",
                proposedBy: "Gbenga History",
                declinedAt: "22 Jul 2026",
                declinedBy: "Gbenga History",
                score: "5",
            },
        ],
    },
];

const MOCK_MENTOR_MATCHES: Match[] = [
    {
        fullName: "Demo Mentee",
        createdAt: "Proposed 21 Jul 2026",
        status: "ACTIVE",
        proposedBy: "AUTO_MATCH",
    },
];

const MOCK_MENTOR_DATA: MentorData = {
    fullName: "Ruta Radiya",
    role: "MENTOR",
    email: "ruta.radiya@mentor.example.dev",
    disciplines: ["Software Engineering", "Career Development", "Interview Prep"],
    capacity: "1/1",
    createdAt: "21 Jul 2026",
    region: "no region · open to remote",
    bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
    links: "None on file",
    availability: [],
    matches: MOCK_MENTOR_MATCHES
};

const MOCK_MENTEES_DATA: MenteesData = [
    {
        fullName: "Gbenga History 1",
        role: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        createdAt: "22 Jul 2026",
        region: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
        matches: [
            {
                fullName: "Issy Geraghty 1",
                createdAt: "22 Jul 2026 — ",
                status: "REJECTED",
                proposedBy: "Gbenga History",
                declinedAt: "22 Jul 2026",
                declinedBy: "Gbenga History",
                score: "5",
            },
        ],
    },
    {
        fullName: "Gbenga History 2",
        role: "MENTEE",
        email: "stage.history@example.dev",
        goals: ["Software Engineering", "Career Development", "Interview Prep"],
        goalsNotes: "Career-switcher aiming for a first tech role.",
        createdAt: "22 Jul 2026",
        region: "no region · open to remote",
        bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
        links: "None on file",
        availability: ["weekday evening", "weekend morning"],
        matches: [
            {
                fullName: "Issy Geraghty 2",
                createdAt: "22 Jul 2026 — ",
                status: "REJECTED",
                proposedBy: "Gbenga History",
                declinedAt: "22 Jul 2026",
                declinedBy: "Gbenga History",
                score: "5",
            },
        ]
    }
]

const MOCK_MENTEE_DATA: MenteeData = {
    fullName: "Gbenga History",
    role: "MENTEE",
    email: "stage.history@example.dev",
    goals: ["Software Engineering", "Career Development", "Interview Prep"],
    goalsNotes: "Career-switcher aiming for a first tech role.",
    createdAt: "22 Jul 2026",
    region: "no region · open to remote",
    bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
    links: "None on file",
    availability: ["weekday evening", "weekend morning"],
    matches: [
        {
            fullName: "Issy Geraghty",
            createdAt: "22 Jul 2026 — ",
            status: "REJECTED",
            proposedBy: "Gbenga History",
            declinedAt: "22 Jul 2026",
            declinedBy: "Gbenga History",
            score: "5",
        },
    ]
};

const MOCK_MENTEE_MATCHES: Match[] = [
    {
        fullName: "Issy Geraghty",
        createdAt: "22 Jul 2026 — ",
        status: "REJECTED",
        proposedBy: "Gbenga History",
        declinedAt: "22 Jul 2026",
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
    const [menteesData] = useState<MenteesData | []>(MOCK_MENTEES_DATA);

    const [mentorsData, setMentorsData] = useState<MentorData[]>([]);
    const refetch = async () => {
        setIsLoading(true);
        try {
            const response = await getMentors();
            if (response?.data) {
                setMentorsData(response.data?.mentors);
            } else if (Array.isArray(response)) {
                setMentorsData(response);
            }
        } catch (error: unknown) {
            console.error("Failed to fetch mentors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (isMounted) {
                await refetch();
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <StaffContext.Provider
            value={{
                globalMatchingData,
                menteesWaitingData,
                mentorData,
                mentorMatches,
                menteeData,
                menteesData,
                menteeMatches,
                isLoading,
                mentorsData,
                refetch,
            }}
        >
            {children}
        </StaffContext.Provider>
    );
};
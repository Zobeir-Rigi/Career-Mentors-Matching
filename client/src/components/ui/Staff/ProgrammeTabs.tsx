import { useState } from "react";
import { OverviewPanel } from "./OverviewPanel";
import { MentorsPanel } from "./MentorsPanel";
import { MenteesPanel } from "./MenteesPanel";
import { SettingsPanel } from "./SettingsPanel";
/** 
 * This mock data will be used before backend implementation
 * and will be replaced with api calls to it.
 */
const mockMentorData = {
    fullName: "Ruta Radiya",
    status: "MENTOR",
    email: "ruta.radiya@mentor.example.dev",
    disciplines: ["Software Engineering", "Career Development", "Interview Prep"],
    capacity: "1/1",
    joined: "21 Jul 2026",
    location: "no region · open to remote",
    bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
    links: "None on file",
    availability: []
}
const mockMentorMatches = [
    {
        fullName: "Demo Mentee",
        proposed: "Proposed 21 Jul 2026",
        status: "ACTIVE",
        proposedBy: "AUTO_MATCH"
    }
]

const mockMenteeMatches = [
    {
        fullName: "Issy Geraghty",
        proposed: "22 Jul 2026 — ",
        status: "REJECTED",
        proposedBy: "Gbenga History",
        declined: "22 Jul 2026",
        declinedBy: "Gbenga History",
        score: "5"
    }
]

const mockMenteeData = {
    fullName: "Gbenga History",
    status: "MENTEE",
    email: "stage.history@example.dev",
    goals: ["Software Engineering", "Career Development", "Interview Prep"],
    goalsNotes: "Career-switcher aiming for a first tech role.",
    joined: "22 Jul 2026",
    location: "no region · open to remote",
    bio: "Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.",
    links: "None on file",
    availability: ["weekday evening", "weekend morning"]
}

export function ProgrammeTabs() {
    const tabs = ["Overview", "Mentors", "Mentees", "Settings"]
    const [activeTab, setActiveTab] = useState<string>("Overview");
    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <div className="container px-5 max-w-[1152px] mx-auto">
            <nav aria-label="Programme navigation" className="-mb-px flex gap-8" role="tablist">
                {
                    tabs.map((tab) => {
                        return (
                            <button
                                key={tab}
                                aria-selected={tab === activeTab}
                                id={`tab-${tab}`}
                                onClick={() => handleTabClick(tab)}
                                className={`pb-1 font-sans transition-colors focus:outline-none ${tab === activeTab
                                    ? "border-b-2 border-accent text-accent"
                                    : "border-b-2 border-transparent text-muted hover:border-gray-300 hover:text-gray-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })
                }
            </nav>
            <div className="-mt-px h-px w-full bg-line" />
            <div className="py-6">
                {activeTab === "Overview" && <OverviewPanel />}
                {activeTab === "Mentors" && <MentorsPanel
                    userData={mockMentorData}
                    mentorMatches={mockMentorMatches}
                />}
                {activeTab === "Mentees" && <MenteesPanel
                    userData={mockMenteeData}
                    menteeMatches={mockMenteeMatches}
                />}
                {activeTab === "Settings" && <SettingsPanel />}
            </div>

        </div>
    );
}
// ProgrammeTabs.tsx
import { useState } from "react";
import { StaffProvider } from "@/lib/context/StaffProvider";
import { OverviewPanel } from "@/components/ui/Staff/OverviewPanel";
import { MentorsPanel } from "@/components/ui/Staff/MentorsPanel";
import { MenteesPanel } from "@/components/ui/Staff/MenteesPanel";
import { SettingsPanel } from "@/components/ui/Staff/SettingsPanel";

function ProgrammeTabsContent() {
    const tabs = ["Overview", "Mentors", "Mentees", "Settings"];
    const [activeTab, setActiveTab] = useState<string>("Overview");

    return (
        <div className="container px-5 max-w-[1152px] mx-auto">
            <nav aria-label="Programme navigation" className="-mb-px flex gap-8" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        aria-selected={tab === activeTab}
                        id={`tab-${tab}`}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-1 font-sans transition-colors focus:outline-none ${tab === activeTab
                            ? "border-b-2 border-accent text-accent"
                            : "border-b-2 border-transparent text-muted hover:border-gray-300 hover:text-gray-700"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
            <div className="-mt-px h-px w-full bg-line" />
            <div className="py-6">
                {activeTab === "Overview" && <OverviewPanel />}
                {activeTab === "Mentors" && <MentorsPanel />}
                {activeTab === "Mentees" && <MenteesPanel />}
                {activeTab === "Settings" && <SettingsPanel />}
            </div>
        </div>
    );
}

export function ProgrammeTabs() {
    return (
        <StaffProvider>
            <ProgrammeTabsContent />
        </StaffProvider>
    );
}
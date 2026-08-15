import { UserDetailsCard } from "@/components/ui/Staff/UserDetailsCard";
import { ProposeMentorForm } from "@/components/ui/Staff/ProposeMentorForm";
import { StaffPageMatches } from "@/components/ui/Staff/StaffPageMatches";
import type { MenteeData, MentorData } from "@/lib/context/StaffContext";
import { useStaff } from "@/lib/context/StaffContext";
import { useState } from "react";

export function MenteesPanel() {
    const { menteeData, menteesData, isLoading } = useStaff();
    const [selectedUser, setSelectedUser] = useState<MenteeData | MentorData | null>(menteeData);
    if (isLoading || !menteesData) {
        return <div>Loading mentees data...</div>;
    }
    return (
        <div>
            <UserDetailsCard
                userData={selectedUser}
                setSelectedUser={setSelectedUser}
            />
            <ProposeMentorForm />
            <StaffPageMatches
                matches={selectedUser?.matches}
            />
        </div>
    );
}
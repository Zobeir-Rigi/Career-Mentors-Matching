import { UserDetailsCard } from "@/components/ui/Staff/UserDetailsCard";
import { ProposeMentorForm } from "@/components/ui/Staff/ProposeMentorForm";
import { StaffPageMatches } from "@/components/ui/Staff/StaffPageMatches";
import type { MenteeData, MentorData } from "@/lib/context/StaffContext";
import { useStaff } from "@/lib/context/StaffContext";
import { useState } from "react";
import { UsersList } from "./UsersList";

export function MenteesPanel() {
    const { menteesData, isLoading } = useStaff();
    const [selectedUser, setSelectedUser] = useState<MenteeData | MentorData | null>(null);
    if (isLoading || !menteesData) {
        return <div>Loading mentees data...</div>;
    }
    return selectedUser ? (
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
    ) : (
        <div>
            <div>
                <UsersList userType={"Mentees"} usersData={menteesData} setSelectedUser={setSelectedUser} />
            </div>
        </div>
    )
}
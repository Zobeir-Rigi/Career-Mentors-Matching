import { UsersList } from "@/components/ui/Staff/UsersList";
import { UserDetailsCard } from "@/components/ui/Staff/UserDetailsCard";
import { StaffPageMatches } from "@/components/ui/Staff/StaffPageMatches";
import type { MenteeData, MentorData } from "@/lib/context/StaffContext";
import { useStaff } from "@/lib/context/StaffContext";
import { useState } from "react";

export function MentorsPanel() {
    const { mentorsData, isLoading } = useStaff();
    const [selectedUser, setSelectedUser] = useState<MenteeData | MentorData | null>(null);

    if (isLoading || !mentorsData) {
        return <div>Loading mentors data...</div>;
    }
    return selectedUser ? (
        <div>
            <UserDetailsCard userData={selectedUser} setSelectedUser={setSelectedUser} />
            <StaffPageMatches matches={selectedUser?.matches} />
        </div>
    ) : (
        <div>
            <UsersList userType={"Mentors"} usersData={mentorsData} setSelectedUser={setSelectedUser} />
        </div>
    );
}
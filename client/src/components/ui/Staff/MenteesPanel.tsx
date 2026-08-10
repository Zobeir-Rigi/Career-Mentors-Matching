import { UserDetailsCard } from "./UserDetailsCard";
import { ProposeMentorForm } from "./ProposeMentorForm";
import { StaffPageMatches } from "./StaffPageMatches";
import { useStaff } from "./StaffContext";

export function MenteesPanel() {
    const { menteeData, menteeMatches, isLoading } = useStaff();
    if (isLoading || !menteeData) {
        return <div>Loading mentee data...</div>;
    }
    return (
        <div>
            <UserDetailsCard
                userData={menteeData}
            />
            <ProposeMentorForm />
            <StaffPageMatches
                matches={menteeMatches}
            />
        </div>
    );
}
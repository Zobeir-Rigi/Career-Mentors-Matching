import { UserDetailsCard } from "./UserDetailsCard";
import { StaffPageMatches } from "./StaffPageMatches";
import { useStaff } from "./StaffContext";

export function MentorsPanel() {
    const { mentorData, mentorMatches, isLoading } = useStaff();

    if (isLoading || !mentorData) {
        return <div>Loading mentor data...</div>;
    }
    return (
        <div>
            <UserDetailsCard userData={mentorData} />
            <StaffPageMatches matches={mentorMatches} />
        </div>
    );
}
import { UserDetailsCard } from "./UserDetailsCard";
import { StaffPageMatches } from "./StaffPageMatches";

export function MentorsPanel({ userData, mentorMatches }: any) {
    return (
        <div>
            <UserDetailsCard userData={userData} />
            <StaffPageMatches matches={mentorMatches} />
        </div>
    );
}
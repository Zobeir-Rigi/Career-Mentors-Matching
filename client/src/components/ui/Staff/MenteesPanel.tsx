import { UserDetailsCard } from "./UserDetailsCard";
import { ProposeMentorForm } from "./ProposeMentorForm";
import { StaffPageMatches } from "./StaffPageMatches";

export function MenteesPanel({ userData, menteeMatches }: any) {
    return (
        <div>
            <UserDetailsCard
                userData={userData}
            />
            <ProposeMentorForm />
            <StaffPageMatches
                matches={menteeMatches}
            />
        </div>
    );
}
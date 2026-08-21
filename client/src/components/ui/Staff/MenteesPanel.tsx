import { UserDetailsCard } from "@/components/ui/Staff/UserDetailsCard";
import { ProposeMentorForm } from "@/components/ui/Staff/ProposeMentorForm";
import { StaffPageMatches } from "@/components/ui/Staff/StaffPageMatches";
import type { MenteeData, MentorData } from "@/lib/context/StaffContext";
import { useStaff } from "@/lib/context/StaffContext";
import { useState } from "react";
import { UsersList } from "./UsersList";

export function MenteesPanel() {
  const {
    menteesData,
    isLoading,
    menteeTotal,
    menteeSearch,
    menteePage,
    menteeLimit,
    setMenteeSearch,
    setMenteePage,
  } = useStaff();

  const [selectedUser, setSelectedUser] = useState<
    MenteeData | MentorData | null
  >(null);

  if (isLoading) {
    return <div>Loading mentees data...</div>;
  }

  return selectedUser ? (
    <div>
      <UserDetailsCard
        userData={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <ProposeMentorForm />

      <StaffPageMatches matches={selectedUser.matches} />
    </div>
  ) : (
    <div>
      <UsersList
        userType="Mentees"
        usersData={menteesData}
        total={menteeTotal}
        searchQuery={menteeSearch}
        onSearchChange={setMenteeSearch}
        page={menteePage}
        limit={menteeLimit}
        onPageChange={setMenteePage}
        setSelectedUser={setSelectedUser}
      />
    </div>
  );
}

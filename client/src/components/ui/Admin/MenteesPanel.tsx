import { UserDetailsCard } from "@/components/ui/Admin/UserDetailsCard";
import { ProposeMentorForm } from "@/components/ui/Admin/ProposeMentorForm";
import { AdminPageMatches } from "@/components/ui/Admin/AdminPageMatches";
import type { MenteeData, MentorData } from "@/lib/context/AdminContext";
import { useAdmin } from "@/lib/context/AdminContext";
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
  } = useAdmin();

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

      <AdminPageMatches matches={selectedUser.matches} />
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

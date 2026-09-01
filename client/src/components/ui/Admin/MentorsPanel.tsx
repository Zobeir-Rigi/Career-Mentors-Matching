import { UsersList } from "@/components/ui/Admin/UsersList";
import { UserDetailsCard } from "@/components/ui/Admin/UserDetailsCard";
import { AdminPageMatches } from "@/components/ui/Admin/AdminPageMatches";
import type { MenteeData, MentorData } from "@/lib/context/AdminContext";
import { useAdmin } from "@/lib/context/AdminContext";
import { useState } from "react";

export function MentorsPanel() {
  const {
    mentorsData,
    isLoading,
    mentorTotal,
    mentorSearch,
    mentorPage,
    mentorLimit,
    setMentorSearch,
    setMentorPage,
  } = useAdmin();

  const [selectedUser, setSelectedUser] = useState<
    MenteeData | MentorData | null
  >(null);

  if (isLoading) {
    return <div>Loading mentors data...</div>;
  }

  return selectedUser ? (
    <div>
      <UserDetailsCard
        userData={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <AdminPageMatches matches={selectedUser.matches} />
    </div>
  ) : (
    <div>
      <UsersList
        userType="Mentors"
        usersData={mentorsData}
        total={mentorTotal}
        searchQuery={mentorSearch}
        onSearchChange={setMentorSearch}
        page={mentorPage}
        limit={mentorLimit}
        onPageChange={setMentorPage}
        setSelectedUser={setSelectedUser}
      />
    </div>
  );
}

import { UsersList } from "@/components/ui/Staff/UsersList";
import { UserDetailsCard } from "@/components/ui/Staff/UserDetailsCard";
import { StaffPageMatches } from "@/components/ui/Staff/StaffPageMatches";
import type { MenteeData, MentorData } from "@/lib/context/StaffContext";
import { useStaff } from "@/lib/context/StaffContext";
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
  } = useStaff();

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

      <StaffPageMatches matches={selectedUser.matches} />
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

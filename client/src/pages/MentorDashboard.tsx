import { Header } from "@/components/Header";
import { MentorCapacityCard } from "@/components/mentorDashboard/MentorCapacityCard";
import { MentorEmptyState } from "@/components/mentorDashboard/MentorEmptyState";
import { MentorProfileSummary } from "@/components/mentorDashboard/MentorProfileSummary";
import { AcceptingMenteesToggle } from "@/components/ui/AcceptingMenteesToggle";
import { MentorMenteeCard } from "@/components/mentorDashboard/MentorMenteeCard";

// import { MentorStatusBadge } from "@/components/ui/MentorApprovalBadge";

export function MentorDashboard() {
  return (
    <div className="min-h-screen bg-bg text-fg p-8 space-y-12">
      <Header></Header>
      <main>
        <MentorStatusBadge />

        <AcceptingMenteesToggle />
      </main>
    </div>
  );
}

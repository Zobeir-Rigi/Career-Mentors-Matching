import { Header } from "@/components/Header";
import { AcceptingMenteesToggle } from "@/components/ui/AcceptingMenteesToggle";
import { MentorStatusBadge } from "@/components/ui/MentorApprovalBadge";

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

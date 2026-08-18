import { useState } from "react";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { MentorshipStages } from "../components/ui/MentorshipStages";
import { DisciplinesBand } from "../components/DisciplinesBand";
import { PastMatches } from "../components/ui/MentorshipStages/PastMatches";

import { useAuth } from "@/lib/context/useAuth";
import { patchMenteeProfile } from "@/services/menteeService";
import { goalOptions } from "@/lib/ProfileOptions";

export function MenteeDashboard() {
  const { profile, isLoading, refreshProfile } = useAuth();

  const menteeProfile = profile && "matchReady" in profile ? profile : null;

  const isMatchReady = Boolean(menteeProfile?.matchReady);

  // null means: use the saved goals from the backend.
  // Once the user edits a chip, this becomes the local draft.
  const [selectedGoals, setSelectedGoals] = useState<string[] | null>(null);

  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  const displayedGoals = selectedGoals ?? menteeProfile?.disciplineGoals ?? [];

  async function handleSaveGoals() {
    try {
      setIsSavingGoals(true);
      setGoalsError(null);

      await patchMenteeProfile({
        disciplineGoals: displayedGoals,
      });

      await refreshProfile();

      // After refreshProfile(), use the newly saved backend value again.
      setSelectedGoals(null);
    } catch (error) {
      console.error("Failed to save mentee goals", error);

      setGoalsError("Unable to save your goals. Please try again.");
    } finally {
      setIsSavingGoals(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-fg p-8">
        <Header />
        <p className="text-muted">Loading your mentorship...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header />
      <main className="space-y-12 p-8">
        <MentorshipStages isMatchReady={isMatchReady} />

        {!isMatchReady && (
          <p className="text-sm text-muted">
            Complete your mentee profile before requesting a mentor match.
          </p>
        )}

        <div>
          <DisciplinesBand
            header="Your goals"
            smallerText="Pick what you want to grow in — this is what the matcher scores."
            isSubmitButtonToRender={true}
            disciplines={goalOptions}
            selectedDisciplines={displayedGoals}
            onSelectedDisciplinesChange={setSelectedGoals}
            onSaveGoals={handleSaveGoals}
            isSavingGoals={isSavingGoals}
          />

          {goalsError && (
            <p className="mt-2 text-sm text-red-600">{goalsError}</p>
          )}
        </div>

        <PastMatches />
      </main>
      <Footer />
    </div>
  );
}

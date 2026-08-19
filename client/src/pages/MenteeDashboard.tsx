import { useEffect, useState } from "react";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { MentorshipStages } from "../components/ui/MentorshipStages";
import { DisciplinesBand } from "../components/DisciplinesBand";
import { PastMatches } from "../components/ui/MentorshipStages/PastMatches";

import { goalOptions } from "@/lib/ProfileOptions";
import { useAuth } from "@/lib/context/useAuth";
import { patchMenteeProfile } from "@/services/menteeService";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";

import {
  acceptMenteeMatch,
  bookMenteeChemistry,
  confirmMenteeMatch,
  declineMenteeMatch,
  endMenteeMatch,
  getMenteeDashboard,
  type MenteeDashboardResponse,
} from "@/services/menteeDashboardService";

type PendingAction = "accept" | "book" | "confirm" | "decline" | "end";

export function MenteeDashboard() {
  const { refreshProfile } = useAuth();

  const [dashboard, setDashboard] = useState<MenteeDashboardResponse | null>(
    null,
  );

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [selectedGoals, setSelectedGoals] = useState<string[] | null>(null);

  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  async function refreshDashboard() {
    const data = await getMenteeDashboard();
    setDashboard(data);
  }

  async function runMatchAction(
    action: PendingAction,
    callback: () => Promise<void>,
  ) {
    if (pendingAction) return;

    try {
      setPendingAction(action);
      setDashboardError(null);

      await callback();
      await refreshDashboard();
    } catch (error) {
      setDashboardError(
        getApiErrorMessage(
          error,
          "Unable to update your mentorship. Please try again.",
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAccept(matchId: string) {
    await runMatchAction("accept", () => acceptMenteeMatch(matchId));
  }

  async function handleBook(matchId: string) {
    await runMatchAction("book", () => bookMenteeChemistry(matchId));
  }

  async function handleConfirm(matchId: string) {
    await runMatchAction("confirm", () => confirmMenteeMatch(matchId));
  }

  async function handleDecline(matchId: string) {
    await runMatchAction("decline", () => declineMenteeMatch(matchId));
  }

  async function handleEnd(matchId: string) {
    await runMatchAction("end", () => endMenteeMatch(matchId));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setDashboardError(null);

        const data = await getMenteeDashboard();

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (error) {
        if (!cancelled) {
          setDashboardError(
            getApiErrorMessage(
              error,
              "Unable to load your mentorship dashboard.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayedGoals = selectedGoals ?? dashboard?.goals ?? [];

  async function handleSaveGoals() {
    try {
      setIsSavingGoals(true);
      setGoalsError(null);

      await patchMenteeProfile({
        disciplineGoals: displayedGoals,
      });

      await refreshProfile();

      await refreshDashboard();

      setSelectedGoals(null);
    } catch (error) {
      setGoalsError(
        getApiErrorMessage(
          error,
          "Unable to save your goals. Please try again.",
        ),
      );
    } finally {
      setIsSavingGoals(false);
    }
  }

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <Header />

        <main className="p-8">
          <p className="text-muted">Loading your mentorship...</p>
        </main>
      </div>
    );
  }

  if (dashboardError || !dashboard) {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <Header />

        <main className="p-8">
          <p role="alert" className="text-error">
            {dashboardError ?? "Unable to load your mentorship dashboard."}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header />

      <main className="space-y-12 p-8">
        <MentorshipStages
          menteeName={dashboard.fullName}
          journeyStage={dashboard.journeyStage}
          matchReady={dashboard.matchReady}
          currentMatch={dashboard.currentMatch}
          onMatchRequested={refreshDashboard}
          onAccept={handleAccept}
          onBook={handleBook}
          onConfirm={handleConfirm}
          onDecline={handleDecline}
          onEnd={handleEnd}
          pendingAction={pendingAction}
        />

        <div>
          <DisciplinesBand
            header="Your goals"
            smallerText="Pick what you want to grow in — this is what the matcher scores."
            disciplines={goalOptions}
            isSubmitButtonToRender={true}
            selectedDisciplines={displayedGoals}
            onSelectedDisciplinesChange={setSelectedGoals}
            onSaveGoals={handleSaveGoals}
            isSavingGoals={isSavingGoals}
          />

          {goalsError && (
            <p role="alert" className="mt-2 text-sm text-error">
              {goalsError}
            </p>
          )}
        </div>

        {dashboard.pastMatches.length > 0 && (
          <PastMatches matches={dashboard.pastMatches} />
        )}
      </main>

      <Footer />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

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
  bookMenteeChemistry,
  declineMenteeMatch,
  endMenteeMatch,
  getMenteeDashboard,
  respondToMenteeCheckIn,
  type MenteeDashboardResponse,
} from "@/services/menteeDashboardService";

import {
  getMentorRecommendations,
  proposeChemistry,
  requestMentorMatch,
  type MatchRequestResponse,
} from "@/services/matchingService";

import type { MentorRecommendation } from "@/types/matching";

type PendingAction = "book" | "check-in" | "decline" | "end";

function shouldAutomaticallyRematch(
  dashboard: MenteeDashboardResponse,
): boolean {
  if (!dashboard.matchReady || dashboard.currentMatch) {
    return false;
  }

  return dashboard.pastMatches[0]?.status === "DECLINED";
}

export function MenteeDashboard() {
  const { refreshProfile } = useAuth();

  const mentorshipSectionRef = useRef<HTMLDivElement | null>(null);

  const [dashboard, setDashboard] = useState<MenteeDashboardResponse | null>(
    null,
  );

  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedGoals, setSelectedGoals] = useState<string[] | null>(null);

  const [isSavingGoals, setIsSavingGoals] = useState(false);

  const [goalsError, setGoalsError] = useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const [recommendationCandidates, setRecommendationCandidates] = useState<
    MentorRecommendation[]
  >([]);

  const [matchingMessage, setMatchingMessage] = useState<string | null>(null);

  const [matchingError, setMatchingError] = useState<string | null>(null);

  const [isFindingMentor, setIsFindingMentor] = useState(false);

  const [isProposingChemistry, setIsProposingChemistry] = useState(false);

  const recommendation = recommendationCandidates[0] ?? null;

  const alternativeRecommendations = recommendationCandidates.slice(1, 3);

  function scrollToMentorship() {
    window.requestAnimationFrame(() => {
      mentorshipSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function refreshDashboard(): Promise<MenteeDashboardResponse> {
    const data = await getMenteeDashboard();

    setDashboard(data);

    return data;
  }

  async function loadRecommendationCandidates(
    bestRecommendation: MentorRecommendation,
  ) {
    const rankedRecommendations = await getMentorRecommendations();

    const remainingRecommendations = rankedRecommendations.filter(
      (item) => item.mentorId !== bestRecommendation.mentorId,
    );

    setRecommendationCandidates([
      bestRecommendation,
      ...remainingRecommendations,
    ]);
  }

  async function applyMatchRequestResult(
    result: MatchRequestResponse,
  ): Promise<void> {
    switch (result.status) {
      case "WAITING":
        setRecommendationCandidates([]);

        setMatchingMessage(
          "We couldn't find a suitable mentor right now. You've been added to the waiting list.",
        );

        return;

      case "RECOMMENDED":
        setMatchingMessage(null);

        await loadRecommendationCandidates(result.recommendation);

        return;

      case "MATCHED":
        setRecommendationCandidates([]);

        setMatchingMessage(null);

        await refreshDashboard();

        return;
    }
  }

  async function findMentorRecommendation() {
    if (isFindingMentor || isProposingChemistry) {
      return;
    }

    try {
      setIsFindingMentor(true);

      setMatchingError(null);
      setMatchingMessage(null);
      setActionError(null);

      const result = await requestMentorMatch();

      await applyMatchRequestResult(result);
    } catch (error) {
      setMatchingError(
        getApiErrorMessage(
          error,
          "We couldn't find a mentor right now. Please try again.",
        ),
      );
    } finally {
      setIsFindingMentor(false);
    }
  }

  function handleRejectRecommendation() {
    setMatchingError(null);

    setRecommendationCandidates((currentCandidates) => {
      if (currentCandidates.length <= 1) {
        setMatchingMessage(
          "There are no other suitable mentor recommendations available right now.",
        );

        return [];
      }

      setMatchingMessage(null);

      return currentCandidates.slice(1);
    });
  }

  async function handleProposeChemistry(mentorId: string) {
    if (isProposingChemistry) {
      return;
    }

    try {
      setIsProposingChemistry(true);

      setMatchingError(null);
      setMatchingMessage(null);
      setActionError(null);

      await proposeChemistry(mentorId);

      setRecommendationCandidates([]);

      await refreshDashboard();

      scrollToMentorship();
    } catch (error) {
      setRecommendationCandidates((currentCandidates) =>
        currentCandidates.filter(
          (candidate) => candidate.mentorId !== mentorId,
        ),
      );

      setMatchingError(
        getApiErrorMessage(
          error,
          "This mentor may no longer be available. We've moved to your next recommendation if one is available.",
        ),
      );
    } finally {
      setIsProposingChemistry(false);
    }
  }

  async function rematchAfterDecline() {
    try {
      setIsFindingMentor(true);

      const result = await requestMentorMatch();

      await applyMatchRequestResult(result);
    } catch (error) {
      setMatchingError(
        getApiErrorMessage(
          error,
          "We couldn't find another mentor right now. Please try again.",
        ),
      );
    } finally {
      setIsFindingMentor(false);
    }
  }

  async function runMatchAction(
    action: PendingAction,
    callback: () => Promise<void>,
    rematchAfterAction = false,
  ) {
    if (pendingAction) {
      return;
    }

    try {
      setPendingAction(action);

      setActionError(null);
      setMatchingError(null);
      setMatchingMessage(null);

      await callback();

      await refreshDashboard();

      if (rematchAfterAction) {
        await rematchAfterDecline();
      }
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Unable to update your mentorship. Please try again.",
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleBook(matchId: string) {
    await runMatchAction("book", () => bookMenteeChemistry(matchId));
  }

  async function handleCheckIn(matchId: string, agreed: boolean) {
    await runMatchAction(
      "check-in",
      () => respondToMenteeCheckIn(matchId, agreed),
      !agreed,
    );
  }

  async function handleDecline(matchId: string) {
    await runMatchAction("decline", () => declineMenteeMatch(matchId), true);
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

        if (cancelled) {
          return;
        }

        setDashboard(data);

        if (!shouldAutomaticallyRematch(data)) {
          return;
        }

        setIsFindingMentor(true);

        try {
          const result = await requestMentorMatch();

          if (cancelled) {
            return;
          }

          switch (result.status) {
            case "WAITING":
              setRecommendationCandidates([]);

              setMatchingMessage(
                "We couldn't find another suitable mentor right now. You've been added to the waiting list.",
              );

              break;

            case "RECOMMENDED": {
              const ranked = await getMentorRecommendations();

              if (cancelled) {
                return;
              }

              const alternatives = ranked.filter(
                (item) => item.mentorId !== result.recommendation.mentorId,
              );

              setRecommendationCandidates([
                result.recommendation,
                ...alternatives,
              ]);

              setMatchingMessage(null);

              break;
            }

            case "MATCHED": {
              const refreshedDashboard = await getMenteeDashboard();

              if (!cancelled) {
                setDashboard(refreshedDashboard);
              }

              break;
            }
          }
        } catch (error) {
          if (!cancelled) {
            setMatchingError(
              getApiErrorMessage(
                error,
                "We couldn't find another mentor right now. Please try again.",
              ),
            );
          }
        } finally {
          if (!cancelled) {
            setIsFindingMentor(false);
          }
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

  const currentMatchStatus = dashboard?.currentMatch?.status;

  useEffect(() => {
    if (
      currentMatchStatus !== "CHEMISTRY_CONFIRMED" &&
      currentMatchStatus !== "MATCH_PENDING"
    ) {
      return;
    }

    let cancelled = false;

    const refreshIntervalId = window.setInterval(async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      try {
        const data = await getMenteeDashboard();

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (error) {
        console.warn(
          "Failed to refresh the mentee dashboard; retrying in five seconds.",
          error,
        );
      }
    }, 5_000);

    return () => {
      cancelled = true;

      window.clearInterval(refreshIntervalId);
    };
  }, [currentMatchStatus]);

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

      setRecommendationCandidates([]);

      setMatchingMessage(null);
      setMatchingError(null);
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

      <main className="space-y-12 p-4 sm:p-8">
        {actionError && (
          <div
            role="alert"
            className="mx-auto max-w-6xl rounded-lg border-l-4 border-error bg-error-tint px-4 py-3"
          >
            <p className="font-sans text-sm font-normal text-error">
              {actionError}
            </p>
          </div>
        )}

        <div ref={mentorshipSectionRef} className="scroll-mt-24">
          <MentorshipStages
            menteeName={dashboard.fullName}
            journeyStage={dashboard.journeyStage}
            matchReady={dashboard.matchReady}
            currentMatch={dashboard.currentMatch}
            recommendation={recommendation}
            alternativeRecommendations={alternativeRecommendations}
            matchingMessage={matchingMessage}
            matchingError={matchingError}
            isFindingMentor={isFindingMentor}
            isProposingChemistry={isProposingChemistry}
            onFindMentor={findMentorRecommendation}
            onProposeChemistry={handleProposeChemistry}
            onRejectRecommendation={handleRejectRecommendation}
            onBook={handleBook}
            onCheckIn={handleCheckIn}
            onDecline={handleDecline}
            onEnd={handleEnd}
            pendingAction={pendingAction}
          />
        </div>

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

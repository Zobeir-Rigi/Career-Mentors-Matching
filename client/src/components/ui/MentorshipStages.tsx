import { cn } from "@/lib/utils";

import { GoalsAndAvailability } from "./MentorshipStages/GoalsAndAvailability";
import { StageTracker } from "./MentorshipStages/StageTracker";
import { AfterMatchProposed } from "./MentorshipStages/afterMatchProposed";
import { StatusBadge } from "./StatusBadge";

import type {
  MenteeDashboardCurrentMatch,
  MenteeJourneyStage,
} from "@/services/menteeDashboardService";

import type { MentorRecommendation } from "@/types/matching";

type PendingAction = "book" | "check-in" | "decline" | "end";

interface MentorshipStagesProps {
  className?: string;

  menteeName: string;

  journeyStage: MenteeJourneyStage;

  matchReady: boolean;

  currentMatch: MenteeDashboardCurrentMatch | null;

  recommendation: MentorRecommendation | null;

  alternativeRecommendations: MentorRecommendation[];

  matchingMessage: string | null;

  matchingError: string | null;

  isFindingMentor: boolean;

  isProposingChemistry: boolean;

  onFindMentor: () => void | Promise<void>;

  onProposeChemistry: (mentorId: string) => void | Promise<void>;

  onRejectRecommendation: () => void;

  onBook: (matchId: string) => void | Promise<void>;

  onCheckIn: (matchId: string, agreed: boolean) => void | Promise<void>;

  onDecline: (matchId: string) => void | Promise<void>;

  onEnd: (matchId: string) => void | Promise<void>;

  pendingAction: PendingAction | null;
}

export function MentorshipStages({
  className,
  menteeName,
  journeyStage,
  matchReady,
  currentMatch,
  recommendation,
  alternativeRecommendations,
  matchingMessage,
  matchingError,
  isFindingMentor,
  isProposingChemistry,
  onFindMentor,
  onProposeChemistry,
  onRejectRecommendation,
  onBook,
  onCheckIn,
  onDecline,
  onEnd,
  pendingAction,
}: MentorshipStagesProps) {
  function renderHeroContent() {
    switch (journeyStage) {
      case "incomplete":
      case "ready":
        return (
          <GoalsAndAvailability
            menteeName={menteeName}
            isProfileComplete={matchReady}
            recommendation={recommendation}
            alternativeRecommendations={alternativeRecommendations}
            isFindingMentor={isFindingMentor}
            isProposingChemistry={isProposingChemistry}
            message={matchingMessage}
            error={matchingError}
            onFindMentor={onFindMentor}
            onProposeChemistry={onProposeChemistry}
            onRejectRecommendation={onRejectRecommendation}
          />
        );

      case "match-proposed":
      case "chemistry-confirm":
      case "mentorship-active":
        if (!currentMatch) {
          return null;
        }

        return (
          <AfterMatchProposed
            currentMatch={currentMatch}
            menteeName={menteeName}
            onBook={onBook}
            onCheckIn={onCheckIn}
            onDecline={onDecline}
            onEnd={onEnd}
            pendingAction={pendingAction}
          />
        );
    }
  }

  return (
    <section className={cn("mx-auto w-full max-w-6xl", className)}>
      <h1 className="overshoot mb-8 font-display text-[36px] font-black leading-tight text-fg">
        Your mentorship
      </h1>

      {journeyStage === "incomplete" && (
        <div className="mb-6">
          <StatusBadge variant="incomplete">Profile incomplete</StatusBadge>
        </div>
      )}

      {journeyStage === "ready" && !recommendation && (
        <div className="mb-6">
          <StatusBadge variant="ready">Ready for matching</StatusBadge>
        </div>
      )}

      <StageTracker
        journeyStage={journeyStage}
        hasRecommendation={Boolean(recommendation)}
      />

      <div className="rounded-[10px] border border-line bg-surface p-5 sm:p-8">
        {renderHeroContent()}
      </div>
    </section>
  );
}

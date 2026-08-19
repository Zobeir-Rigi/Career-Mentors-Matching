import { cn } from "@/lib/utils";
import { GoalsAndAvailability } from "./MentorshipStages/GoalsAndAvailability";
import { StageTracker } from "./MentorshipStages/StageTracker";
import { AfterMatchProposed } from "./MentorshipStages/afterMatchProposed";

import type {
  MenteeDashboardCurrentMatch,
  MenteeJourneyStage,
} from "@/services/menteeDashboardService";

type PendingAction = "accept" | "book" | "confirm" | "decline" | "end";

interface MentorshipStagesProps {
  className?: string;
  menteeName: string;
  journeyStage: MenteeJourneyStage;
  matchReady: boolean;
  currentMatch: MenteeDashboardCurrentMatch | null;

  onMatchRequested: () => void | Promise<void>;
  onAccept: (matchId: string) => void | Promise<void>;
  onBook: (matchId: string) => void | Promise<void>;
  onConfirm: (matchId: string) => void | Promise<void>;
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
  onMatchRequested,
  onAccept,
  onBook,
  onConfirm,
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
            isProfileComplete={matchReady}
            onMatchRequested={onMatchRequested}
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
            journeyStage={journeyStage}
            onAccept={onAccept}
            onBook={onBook}
            onConfirm={onConfirm}
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

      <StageTracker journeyStage={journeyStage} />

      <div className="rounded-[10px] border border-line bg-surface p-6 sm:p-8">
        {renderHeroContent()}
      </div>
    </section>
  );
}

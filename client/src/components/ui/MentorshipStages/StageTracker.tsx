import type { MenteeJourneyStage } from "@/services/menteeDashboardService";

interface StageTrackerProps {
  journeyStage: MenteeJourneyStage;
  hasRecommendation?: boolean;
}

const stages = [
  "Goals & availability",
  "Match proposed",
  "Chemistry & confirm",
  "Mentorship active",
];

function getCurrentStageNumber(
  journeyStage: MenteeJourneyStage,
  hasRecommendation: boolean,
): number {
  switch (journeyStage) {
    case "incomplete":
      return 1;

    case "ready":
      return hasRecommendation ? 2 : 1;

    case "match-proposed":
      return 2;

    case "chemistry-confirm":
      return 3;

    case "mentorship-active":
      return 4;
  }
}

export function StageTracker({
  journeyStage,
  hasRecommendation = false,
}: StageTrackerProps) {
  const currentStageNumber = getCurrentStageNumber(
    journeyStage,
    hasRecommendation,
  );

  return (
    <div className="mb-8 grid grid-cols-1 gap-y-5 sm:grid-cols-2 lg:flex lg:items-center lg:justify-between">
      {stages.map((stage, index) => {
        const stageNumber = index + 1;

        const isCompleted = stageNumber < currentStageNumber;

        const isCurrent = stageNumber === currentStageNumber;

        const circleStyle = isCompleted
          ? "border-accent bg-accent"
          : isCurrent
            ? "border-2 border-accent bg-bg"
            : "border border-line bg-bg";

        const textStyle = isCompleted
          ? "text-muted line-through"
          : isCurrent
            ? "font-bold text-fg"
            : "font-normal text-muted";

        const lineStyle =
          stageNumber < currentStageNumber ? "border-accent" : "border-line";

        return (
          <div key={stage} className="flex w-full items-center lg:w-auto">
            <div className="flex items-center">
              <span
                aria-hidden="true"
                className={`mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${circleStyle}`}
              >
                {isCompleted ? "✓" : ""}
              </span>

              <p className={`font-sans text-sm ${textStyle}`}>{stage}</p>
            </div>

            {stageNumber < stages.length && (
              <div
                aria-hidden="true"
                className={`ml-4 hidden w-20 border-t-2 lg:block xl:w-26 ${lineStyle}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

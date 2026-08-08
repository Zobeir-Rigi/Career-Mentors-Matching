import { cn } from "../../lib/utils";
import { useState } from "react";
import { GoalsAndAvailability } from "./MentorshipStages/GoalsAndAvailability";
import { StageTracker } from "./MentorshipStages/StageTracker";
import { AfterMatchProposed } from "./MentorshipStages/afterMatchProposed";

interface MentorshipStagesProps {
  className?: string;
}

export function MentorshipStages({ className }: MentorshipStagesProps) {
  const steps = [
    "complete-profile",
    "incomplete-profile",
    "match-proposed",
    "chemistry-and-confirm",
    "mentorship-booked",
    "mentorship-confirmed-waiting",
    "mentorship-active",
  ];
  const [isProfileComplete] = useState<boolean>(true);
  const [currentStep, setCurrentView] = useState(
    isProfileComplete ? steps[0] : steps[1],
  );
  function renderHeroContent() {
    switch (currentStep) {
      case "complete-profile":
      case "incomplete-profile":
        return (
          <GoalsAndAvailability
            isProfileComplete={isProfileComplete}
            onStepSubmit={handleStepChange}
            currentStep={currentStep}
          />
        );
      case "match-proposed":
      case "chemistry-and-confirm":
      case "mentorship-booked":
      case "mentorship-confirmed-waiting":
      case "mentorship-active":
        return (
          <AfterMatchProposed
            onStepSubmit={handleStepChange}
            currentStep={currentStep}
            steps={steps}
          />
        );
      default:
        return "default";
    }
  }
  const [currentStepNumber, setCurrentStep] = useState(
    isProfileComplete ? 2 : 1,
  );
  const [circleStyles, setCircleStyles] = useState<Record<number, string>>({
    1: isProfileComplete
      ? "bg-accent-soft border-accent-soft"
      : "border-2 border-accent-soft",
    2: isProfileComplete
      ? "border-2 border-accent-soft"
      : "border - 1 border- muted",
    3: "border-1 border-muted",
    4: "border-1 border-muted",
  });
  const [progressTextStyles, setProgressTextStyles] = useState<
    Record<number, string>
  >({
    1: isProfileComplete ? "line-through" : "",
    2: "",
    3: "",
    4: "",
  });
  const [progressLinesStyles, setProgressLinesStyles] = useState<
    Record<number, string>
  >({
    1: "bg-accent-soft border-accent-soft",
    2: "border-line",
    3: "border-line",
  });

  function handleStepChange(viewToRender: string, changeProgressBar = true) {
    setCurrentView(viewToRender);
    if (!changeProgressBar) return;
    setCurrentStep(currentStepNumber + 1);
    setCircleStyles((prev) => ({
      ...prev,
      [currentStepNumber]: "bg-accent-soft border-accent-soft",
      [currentStepNumber + 1]: "border-2 border-accent-soft",
    }));
    setProgressTextStyles((prev) => ({
      ...prev,
      [currentStepNumber]: "line-through",
      [currentStepNumber + 1]: "font-semibold",
    }));
    setProgressLinesStyles((prev) => ({
      ...prev,
      [currentStepNumber]: "bg-accent-soft border-accent-soft",
    }));
  }

  return (
    <div className={cn("container max-w-[1152px] mx-auto", className)}>
      <div className="container max-w-[1152px] mx-auto">
        <h1 className="overshoot font-display font-semibold text-[36px] mb-6">
          Your mentorship
        </h1>
        <StageTracker
          circleStyles={circleStyles}
          progressTextStyles={progressTextStyles}
          progressLinesStyles={progressLinesStyles}
        />
        <div className="container max-w-[1152px] mx-auto bg-surface rounded-[10px] border border-line p-1 p-8">
          {renderHeroContent()}
        </div>
      </div>
    </div>
  );
}

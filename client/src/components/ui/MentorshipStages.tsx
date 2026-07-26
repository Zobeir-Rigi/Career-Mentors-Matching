import { cn } from "../../lib/utils";
import { useState } from "react";
import { GoalsAndAvailability } from "./MentorshipStages/GoalsAndAvailability";
import { StageTracker } from "./MentorshipStages/StageTracker";
import { AfterMatchProposed } from "./MentorshipStages/afterMatchProposed";
import { DisciplinesBand } from "../DisciplinesBand";


export function MentorshipStages({ className, children }: any) {
    const steps = [
        "complete-profile",
        "incomplete-profile",
        "match-proposed",
        "chemistry-and-confirm",
        "mentorship-booked",
        "mentorship-confirmed-waiting",
        "mentorship-active"
    ]
    const [isProfileComplete, setProfileComplete] = useState<Boolean>(true);
    const [currentStep, setCurrentView] = isProfileComplete ? useState(steps[1]) : useState(steps[0]);
    function renderHeroContent() {
        switch (currentStep) {
            case "complete-profile":
            case "incomplete-profile":
                return <GoalsAndAvailability
                    isProfileComplete={isProfileComplete}
                    onStepSubmit={handleStepChange}
                    currentStep={currentStep}
                />
            case "match-proposed":
            case "chemistry-and-confirm":
            case "mentorship-booked":
            case "mentorship-confirmed-waiting":
            case "mentorship-active":
                return <AfterMatchProposed
                    onStepSubmit={handleStepChange}
                    currentStep={currentStep}
                    steps={steps}
                />
            default:
                return "default";
        }
    }
    const [currentStepNumber, setCurrentStep] = isProfileComplete ? useState<number>(1) : useState<number>(2);
    const [circleStyles, setCircleStyles] = useState<Record<number, string>>({
        1: isProfileComplete ? "bg-accent-soft border-accent-soft" : "border-2 border-accent-soft",
        2: isProfileComplete ? "border-2 border-accent-soft" : "border - 1 border- muted",
        3: "border-1 border-muted",
        4: "border-1 border-muted"
    });
    const [progressTextStyles, setProgressTextStyles] = useState<Record<number, string>>({
        1: isProfileComplete ? "line-through" : "",
        2: "",
        3: "",
        4: ""
    });
    const [progressLinesStyles, setProgressLinesStyles] = useState<Record<number, string>>({
        1: "bg-accent-soft border-accent-soft",
        2: "border-line",
        3: "border-line"
    });

    function handleStepChange(viewToRender: string, changeProgressBar: boolean) {
        setCurrentView(viewToRender);
        if (!changeProgressBar) return
        setCurrentStep(currentStepNumber + 1);
        setCircleStyles((prev) => ({
            ...prev,
            [currentStepNumber]: "bg-accent-soft border-accent-soft",
            [currentStepNumber + 1]: "border-2 border-accent-soft"
        }));
        setProgressTextStyles((prev) => ({
            ...prev,
            [currentStepNumber]: "line-through",
            [currentStepNumber + 1]: "font-semibold"
        }));
        setProgressLinesStyles((prev) => ({
            ...prev,
            [currentStepNumber]: "bg-accent-soft border-accent-soft",
        }));
    }

    return (
        <div className={cn("container max-w-[1152px] mx-auto", className,)}>
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
                <DisciplinesBand
                    header={"Your goals"}
                    smallerText={"Pick what you want to grow in — this is what the matcher scores."}
                    isSubmitButtonToRender={true}
                />
            </div>
        </div>
    );
}
import { Thread } from "../Thread";
import { Button } from "../Button";

import type { MentorRecommendation } from "@/types/matching";

interface AfterMatchProposedProps {
  onStepSubmit: (nextStep: string, changeProgressBar?: boolean) => void;
  currentStep: string;
  steps: string[];
  mentors: MentorRecommendation[];
}

export function AfterMatchProposed({
  onStepSubmit,
  currentStep,
  steps,
  mentors,
}: AfterMatchProposedProps) {
  const nextStep = steps[steps.indexOf(currentStep) + 1];

  function shouldChangeProgressBar(step: string): boolean {
    switch (step) {
      case "mentorship-confirmed-waiting":
      case "mentorship-active":
        return true;

      case "match-proposed":
      case "chemistry-and-confirm":
      case "mentorship-booked":
      case "mentor-confirm":
      default:
        return false;
    }
  }

  const changeProgressBar = shouldChangeProgressBar(currentStep);

  function matchStatus() {
    switch (currentStep) {
      case "match-proposed":
        return (
          <div className="rounded-[20px] bg-tint w-[137px] text-left pl-3 p-1">
            <p className="text-accent font-sans text-[12px]">Awaiting</p>
            <p className="text-accent font-sans text-[12px]">acceptance</p>
          </div>
        );

      case "chemistry-and-confirm":
      case "mentorship-booked":
      case "mentor-confirm":
      case "mentorship-confirmed-waiting":
        return (
          <div className="rounded-[20px] bg-tint w-[137px] text-left pl-3 p-1">
            <p className="text-warm font-sans text-[12px]">Chemistry &</p>
            <p className="text-warm font-sans text-[12px]">confirm</p>
          </div>
        );

      case "mentorship-active":
        return (
          <div className="rounded-[20px] bg-ok-tint w-[137px] text-left pl-3 p-1">
            <p className="text-ok font-sans text-[12px]">Active</p>
          </div>
        );

      default:
        return null;
    }
  }

  function renderConfirmButton() {
    switch (currentStep) {
      case "chemistry-and-confirm":
        return (
          <Button
            onClick={() => onStepSubmit(nextStep, changeProgressBar)}
            className="bg-accent text-on-accent"
          >
            I've booked our session
          </Button>
        );

      case "mentorship-booked":
      case "mentor-confirm":
      case "mentorship-confirmed-waiting":
        return (
          <Button
            onClick={() => onStepSubmit(nextStep, changeProgressBar)}
            className="bg-accent text-on-accent"
          >
            Confirm mentorship
          </Button>
        );

      default:
        return null;
    }
  }

  if (currentStep === "match-proposed") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-semibold text-[24px]">
            Your mentor recommendations
          </h2>

          <p className="text-muted text-sm mt-1">
            Ranked using your goals, availability, location and meeting
            preferences.
          </p>
        </div>

        <div className="space-y-4">
          {mentors.map((mentor, index) => (
            <div
              key={mentor.mentorId}
              className="border border-line rounded-[10px] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {index === 0 && (
                    <p className="text-xs font-semibold text-accent mb-1">
                      Best match
                    </p>
                  )}

                  <h3 className="font-display font-semibold text-[20px]">
                    {mentor.profile.fullName}
                  </h3>

                  {mentor.profile.currentJobTitle && (
                    <p className="text-muted text-sm">
                      {mentor.profile.currentJobTitle}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-semibold text-accent">
                    {mentor.score}% match
                  </p>
                </div>
              </div>

              {mentor.profile.bio && (
                <p className="mt-4 text-sm">{mentor.profile.bio}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
                {mentor.profile.region && (
                  <span>{mentor.profile.region.replaceAll("_", " ")}</span>
                )}

                {mentor.profile.openToRemote && <span>Open to remote</span>}
              </div>

              {mentor.profile.linkedinURL && (
                <div className="mt-4">
                  <a
                    href={mentor.profile.linkedinURL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline text-sm"
                  >
                    View LinkedIn
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-row w-full">
          <div className="w-[40%]">
            <p className="font-display font-semibold text-[20px] text-right">
              You
            </p>
          </div>

          <div className="w-[20%] flex flex-col justify-center items-center">
            <Thread />
            {matchStatus()}
          </div>

          <div className="w-[40%]">
            <p className="font-sans text-[14px] text-muted">Mentor selected</p>
          </div>
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-200 my-4" />

      <div className="flex flex-row">
        <div className="w-[50%] text-left flex items-center">
          <p className="text-muted text-[13px]">7 days left</p>
        </div>

        <div className="w-[50%] text-right">
          {currentStep !== "mentorship-active" ? renderConfirmButton() : null}

          <Button className="ml-2" variant="outline">
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Thread } from "../Thread";
import { Button } from "../Button";

import type { MentorRecommendation } from "@/types/matching";
import { getMentorRecommendations } from "@/services/matchingService";
interface GoalsAndAvailabilityProps {
  isProfileComplete: boolean;
  onStepSubmit: (viewToRender: string, changeProgressBar?: boolean) => void;

  onRecommendationsFound: (recommendations: MentorRecommendation[]) => void;
}

export function GoalsAndAvailability({
  isProfileComplete,
  onStepSubmit,
  onRecommendationsFound,
}: GoalsAndAvailabilityProps) {
  const navigate = useNavigate();

  const [isFindingMentor, setIsFindingMentor] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleFindMentor() {
    if (!isProfileComplete) {
      navigate("/mentee/profile");
      return;
    }
    try {
      setIsFindingMentor(true);
      setError(null);

      const recommendations = await getMentorRecommendations();

      if (recommendations.length === 0) {
        setError("We couldn't find a suitable mentor right now.");
        // post the mentee id to the waiting list
        return;
      }

      onRecommendationsFound(recommendations);
      onStepSubmit("match-proposed");
    } catch (error) {
      console.error("Failed to find mentor recommendations", error);
      setError("We couldn't find a mentor right now. Please try again");
    } finally {
      setIsFindingMentor(false);
    }
  }
  return (
    <div>
      <div className="w-full h-8 mb-4 flex justify-center items-center">
        <Thread />
      </div>
      <p className="font-display font-semibold text-[22px] text-center">
        One dot is you. Let's find the other one.
      </p>
      <p className="font-sans text-[16px] text-muted text-center">
        {isProfileComplete ? (
          "You are all set — ask for a match and we will propose the best available mentor."
        ) : (
          <>
            Add your availability{" "}
            <span className="underline text-accent">in your profile</span> — the
            matcher only
          </>
        )}
      </p>

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
      )}

      <p className="font-sans text-[16px] text-muted text-center mb-4">
        proposes mentors whose time can work with yours.
      </p>
      <div className="container text-center">
        <Button
          onClick={() => handleFindMentor()}
          disabled={isFindingMentor}
          className="bg-accent text-on-accent"
        >
          {isFindingMentor ? "Finding mentors..." : "Find me a mentor"}
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Thread } from "../Thread";
import { Button } from "../Button";

import { requestMentorMatch } from "@/services/matchingService";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";

interface GoalsAndAvailabilityProps {
  isProfileComplete: boolean;
  onMatchRequested: () => void | Promise<void>;
}

export function GoalsAndAvailability({
  isProfileComplete,
  onMatchRequested,
}: GoalsAndAvailabilityProps) {
  const navigate = useNavigate();

  const [isFindingMentor, setIsFindingMentor] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFindMentor() {
    if (!isProfileComplete) {
      navigate("/mentee/profile");
      return;
    }

    if (isFindingMentor) return;

    try {
      setIsFindingMentor(true);
      setError(null);
      setMessage(null);

      const bestMatch = await requestMentorMatch();

      if (bestMatch.status === "WAITING") {
        setMessage(
          "We couldn't find a suitable mentor right now. You've been added to the waiting list.",
        );
        return;
      }

      await onMatchRequested();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "We couldn't find a mentor right now. Please try again.",
        ),
      );
    } finally {
      setIsFindingMentor(false);
    }
  }

  return (
    <div className="py-4">
      <div className="w-full h-8 mb-5 flex justify-center items-center">
        <Thread />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-[22px] font-black text-fg">
          One dot is you. Let's find the other one.
        </h2>
      </div>

      <div className="mt-3 font-sans text-[16px] font-normal leading-6 text-center text-muted">
        {isProfileComplete ? (
          <p>
            "You are all set — ask for a match and we will propose the best
            available mentor."
          </p>
        ) : (
          <p>
            Add your availability{" "}
            <Link
              to="/mentee/profile"
              className="font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
            >
              in your profile
            </Link>{" "}
            — the matcher only proposes mentors whose time can work with yours.
          </p>
        )}
      </div>

      {message && (
        <div
          role="status"
          className="mt-5 rounded-lg border border-line bg-tint px-4 py-3"
        >
          <p className="font-sans text-sm font-normal text-fg">{message}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border-l-4 border-error bg-error-tint px-4 py-3 text-left"
        >
          <p className="font-sans text-sm font-normal text-error">{error}</p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button
          onClick={() => void handleFindMentor()}
          disabled={isFindingMentor}
          className="bg-accent text-on-accent hover:bg-accent-hover"
        >
          {isFindingMentor ? "Finding mentors..." : "Find me a mentor"}
        </Button>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";

import { Thread } from "../Thread";
import { Button } from "../Button";

import type { MentorRecommendation } from "@/types/matching";

interface GoalsAndAvailabilityProps {
  menteeName: string;

  isProfileComplete: boolean;

  recommendation: MentorRecommendation | null;

  alternativeRecommendations: MentorRecommendation[];

  isFindingMentor: boolean;

  isProposingChemistry: boolean;

  message: string | null;

  error: string | null;

  onFindMentor: () => void | Promise<void>;

  onProposeChemistry: (mentorId: string) => void | Promise<void>;

  onRejectRecommendation: () => void;
}

function getLinkedInUrl(linkedinURL: string): string {
  if (linkedinURL.startsWith("http://") || linkedinURL.startsWith("https://")) {
    return linkedinURL;
  }

  return `https://${linkedinURL}`;
}

export function GoalsAndAvailability({
  menteeName,
  isProfileComplete,
  recommendation,
  alternativeRecommendations,
  isFindingMentor,
  isProposingChemistry,
  message,
  error,
  onFindMentor,
  onProposeChemistry,
  onRejectRecommendation,
}: GoalsAndAvailabilityProps) {
  const navigate = useNavigate();

  function handleFindMentor() {
    if (!isProfileComplete) {
      navigate("/mentee/profile");
      return;
    }

    void onFindMentor();
  }

  if (recommendation) {
    return (
      <div className="py-2">
        <div className="mx-auto flex max-w-xl items-center justify-center gap-2 sm:gap-4">
          <div className="min-w-0 flex-1 text-right">
            <p className="font-display text-sm font-black text-fg sm:text-base">
              You
            </p>

            <p className="mt-0.5 truncate text-xs text-muted">{menteeName}</p>
          </div>

          <Thread className="h-8 w-24 shrink-0 sm:h-10 sm:w-36" />

          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-display text-sm font-black text-fg sm:text-base">
              {recommendation.profile.fullName}
            </p>

            <p className="mt-0.5 text-xs text-muted">Recommended mentor</p>
          </div>
        </div>

        <div className="mx-auto mt-7 max-w-2xl text-center">
          <h2 className="font-display text-[24px] font-black text-fg">
            Meet your recommended mentor
          </h2>

          <p className="mt-2 font-sans text-[15px] font-normal leading-6 text-muted">
            Based on your goals and availability,{" "}
            {recommendation.profile.fullName} is your strongest current match.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-2xl rounded-lg border-l-4 border-error bg-error-tint px-4 py-3"
          >
            <p className="font-sans text-sm font-normal text-error">{error}</p>
          </div>
        )}

        <article className="mx-auto mt-7 max-w-2xl rounded-[10px] border border-line bg-bg p-5 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-wide text-accent">
                Best match
              </p>

              <h3 className="mt-1 font-display text-[24px] font-black text-fg">
                {recommendation.profile.fullName}
              </h3>

              {recommendation.profile.currentJobTitle && (
                <p className="mt-1 font-sans text-sm font-normal text-muted">
                  {recommendation.profile.currentJobTitle}
                </p>
              )}
            </div>

            <p className="shrink-0 font-sans text-sm font-bold text-accent">
              {Math.round(recommendation.score)}% match
            </p>
          </div>

          {recommendation.profile.bio && (
            <p className="mt-5 font-sans text-sm font-normal leading-6 text-fg">
              {recommendation.profile.bio}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-sans text-sm font-normal text-muted">
            {recommendation.profile.region && (
              <span>{recommendation.profile.region.replaceAll("_", " ")}</span>
            )}

            {recommendation.profile.openToRemote && (
              <span>Open to remote mentoring</span>
            )}
          </div>

          {recommendation.profile.linkedinURL && (
            <div className="mt-4">
              <a
                href={getLinkedInUrl(recommendation.profile.linkedinURL)}
                target="_blank"
                rel="noreferrer"
                className="font-sans text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
              >
                View LinkedIn profile
              </a>
            </div>
          )}

          <div className="mt-6 border-t border-line pt-6">
            <p className="font-sans text-sm font-normal leading-6 text-muted">
              You have not been matched yet. The mentor's availability will be
              checked again when you propose a chemistry session.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => void onProposeChemistry(recommendation.mentorId)}
                disabled={isProposingChemistry || isFindingMentor}
                className="bg-accent text-on-accent hover:bg-accent-hover"
              >
                {isProposingChemistry
                  ? "Sending proposal..."
                  : "Propose chemistry session"}
              </Button>

              <Button
                variant="outline"
                onClick={onRejectRecommendation}
                disabled={isProposingChemistry || isFindingMentor}
              >
                Not for me
              </Button>
            </div>
          </div>
        </article>

        {alternativeRecommendations.length > 0 && (
          <section className="mx-auto mt-9 max-w-2xl border-t border-line pt-7">
            <div>
              <h3 className="font-display text-xl font-black text-fg">
                Other strong matches
              </h3>

              <p className="mt-2 font-sans text-sm font-normal leading-6 text-muted">
                These are the next highest-ranked mentors based on your goals,
                availability and preferences.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {alternativeRecommendations
                .slice(0, 2)
                .map((alternative, index) => (
                  <article
                    key={alternative.mentorId}
                    className="rounded-[10px] border border-line bg-bg p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-sans text-xs font-bold uppercase tracking-wide text-accent">
                          Recommendation #{index + 2}
                        </p>

                        <h4 className="mt-1 font-display text-lg font-black text-fg">
                          {alternative.profile.fullName}
                        </h4>

                        {alternative.profile.currentJobTitle && (
                          <p className="mt-1 font-sans text-sm font-normal text-muted">
                            {alternative.profile.currentJobTitle}
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 font-sans text-sm font-bold text-accent">
                        {Math.round(alternative.score)}%
                      </p>
                    </div>

                    {alternative.profile.bio && (
                      <p className="mt-4 font-sans text-sm font-normal leading-6 text-fg">
                        {alternative.profile.bio}
                      </p>
                    )}

                    {alternative.profile.linkedinURL && (
                      <a
                        href={getLinkedInUrl(alternative.profile.linkedinURL)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block font-sans text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
                      >
                        View LinkedIn
                      </a>
                    )}
                  </article>
                ))}
            </div>

            <p className="mt-4 font-sans text-xs font-normal text-muted">
              These alternatives are for comparison only for now.
            </p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-5 flex h-8 w-full items-center justify-center">
        <Thread />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-[22px] font-black text-fg">
          One dot is you. Let's find the other one.
        </h2>

        <div className="mt-3 font-sans text-[16px] font-normal leading-6 text-muted">
          {isProfileComplete ? (
            <p>You are ready to start matching.</p>
          ) : (
            <p>
              Your profile is not complete yet.{" "}
              <Link
                to="/mentee/profile"
                className="font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
              >
                Complete your profile
              </Link>{" "}
              before requesting a mentor match.
            </p>
          )}
        </div>
      </div>

      {message && (
        <div
          role="status"
          className="mx-auto mt-5 max-w-2xl rounded-lg border border-line bg-tint px-4 py-3"
        >
          <p className="font-sans text-sm font-normal text-fg">{message}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mx-auto mt-5 max-w-2xl rounded-lg border-l-4 border-error bg-error-tint px-4 py-3"
        >
          <p className="font-sans text-sm font-normal text-error">{error}</p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleFindMentor}
          disabled={isFindingMentor || isProposingChemistry}
          className="bg-accent text-on-accent hover:bg-accent-hover"
        >
          {isFindingMentor
            ? "Finding mentors..."
            : isProfileComplete
              ? "Find me a mentor"
              : "Complete your profile"}
        </Button>
      </div>
    </div>
  );
}

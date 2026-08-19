import { useState } from "react";

import { Thread } from "../Thread";
import { Button } from "../Button";

import { getApiErrorMessage } from "@/services/getApiErrorMessages";
import { getMentorRecommendations } from "@/services/matchingService";

import type {
  MenteeDashboardCurrentMatch,
  MenteeJourneyStage,
} from "@/services/menteeDashboardService";

import type { MentorRecommendation } from "@/types/matching";

type PendingAction = "accept" | "book" | "confirm" | "decline" | "end";

interface AfterMatchProposedProps {
  currentMatch: MenteeDashboardCurrentMatch;
  menteeName: string;
  journeyStage: MenteeJourneyStage;

  onAccept: (matchId: string) => void | Promise<void>;
  onBook: (matchId: string) => void | Promise<void>;
  onConfirm: (matchId: string) => void | Promise<void>;
  onDecline: (matchId: string) => void | Promise<void>;
  onEnd: (matchId: string) => void | Promise<void>;

  pendingAction: PendingAction | null;
}

export function AfterMatchProposed({
  currentMatch,
  menteeName,
  journeyStage,
  onAccept,
  onBook,
  onConfirm,
  onDecline,
  onEnd,
  pendingAction,
}: AfterMatchProposedProps) {
  const { mentor, subStatus, countdown } = currentMatch;

  const [showMoreRecommendations, setShowMoreRecommendations] = useState(false);

  const [recommendations, setRecommendations] = useState<
    MentorRecommendation[]
  >([]);

  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);

  const [recommendationsError, setRecommendationsError] = useState<
    string | null
  >(null);

  const isActionPending = pendingAction !== null;

  async function handleViewMoreRecommendations() {
    if (showMoreRecommendations) {
      setShowMoreRecommendations(false);
      return;
    }

    if (recommendations.length > 0) {
      setShowMoreRecommendations(true);
      return;
    }

    try {
      setIsLoadingRecommendations(true);
      setRecommendationsError(null);

      const results = await getMentorRecommendations();

      const alternatives = results
        .filter(
          (recommendation) =>
            recommendation.mentorId !== currentMatch.mentor.id,
        )
        .slice(0, 2);

      setRecommendations(alternatives);
      setShowMoreRecommendations(true);
    } catch (error) {
      setRecommendationsError(
        getApiErrorMessage(
          error,
          "Unable to load more mentor recommendations. Please try again.",
        ),
      );
    } finally {
      setIsLoadingRecommendations(false);
    }
  }

  function renderStatus() {
    switch (subStatus) {
      case "proposed":
        return (
          <div className="rounded-full bg-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-accent">
              Awaiting acceptance
            </p>
          </div>
        );

      case "awaiting-booking":
        return (
          <div className="rounded-full bg-warn-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-warn">
              Chemistry & confirm
            </p>
          </div>
        );

      case "booked":
        return (
          <div className="rounded-full bg-warn-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-warn">
              Chemistry session booked
            </p>
          </div>
        );

      case "confirmed-waiting":
        return (
          <div className="rounded-full bg-warn-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-warn">
              Confirmation pending
            </p>
          </div>
        );

      case "active":
        return (
          <div className="rounded-full bg-ok-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-ok">Active</p>
          </div>
        );
    }
  }

  function renderPrimaryAction() {
    switch (subStatus) {
      case "proposed":
        return (
          <Button
            className="bg-accent text-on-accent hover:bg-accent-hover"
            onClick={() => void onAccept(currentMatch.id)}
            disabled={isActionPending}
          >
            {pendingAction === "accept" ? "Accepting..." : "Accept match"}
          </Button>
        );

      case "awaiting-booking":
        return (
          <Button
            className="bg-accent text-on-accent hover:bg-accent-hover"
            onClick={() => void onBook(currentMatch.id)}
            disabled={isActionPending}
          >
            {pendingAction === "book" ? "Saving..." : "I've booked our session"}
          </Button>
        );

      case "booked":
      case "confirmed-waiting":
        return (
          <Button
            className="bg-accent text-on-accent hover:bg-accent-hover"
            onClick={() => void onConfirm(currentMatch.id)}
            disabled={isActionPending}
          >
            {pendingAction === "confirm"
              ? "Confirming..."
              : "Confirm mentorship"}
          </Button>
        );

      case "active":
        return (
          <Button
            variant="outline"
            onClick={() => void onEnd(currentMatch.id)}
            disabled={isActionPending}
          >
            {pendingAction === "end" ? "Ending..." : "End mentorship"}
          </Button>
        );
    }
  }
  const showDecline = journeyStage !== "mentorship-active";

  const canViewMoreRecommendations = subStatus === "proposed";

  return (
    <div className="space-y-8">
      <div>
        <div className="flex w-full items-center justify-center">
          <div className="flex w-full items-center">
            <div className="w-[40%] text-right">
              <p className="font-display text-[20px] font-black text-fg">You</p>
              <p className="mt-1 text-xs text-muted">{menteeName}</p>
            </div>

            <div className="flex w-[20%] flex-col items-center justify-center gap-2">
              <Thread />

              {renderStatus()}
            </div>

            <div className="w-[40%]">
              <p className="font-display text-[20px] font-black text-fg">
                {mentor.fullName}
              </p>

              {mentor.currentJobTitle && (
                <p className="mt-1 font-sans text-sm font-normal text-muted">
                  {mentor.currentJobTitle}
                </p>
              )}

              {mentor.bio && (
                <p className="mt-4 max-w-xl font-sans text-sm font-normal leading-6 text-fg">
                  {mentor.bio}
                </p>
              )}

              {mentor.focusAreas.length > 0 && (
                <p className="mt-1 font-sans text-sm font-normal text-muted">
                  {mentor.focusAreas.join(" · ")}
                </p>
              )}

              {mentor.linkedinURL && (
                <a
                  href={
                    mentor.linkedinURL.startsWith("http://") ||
                    mentor.linkedinURL.startsWith("https://")
                      ? mentor.linkedinURL
                      : `https://${mentor.linkedinURL}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block font-sans text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
                >
                  View LinkedIn profile
                </a>
              )}

              {["awaiting-booking", "booked", "confirmed-waiting"].includes(
                subStatus,
              ) &&
                mentor.calendarLink && (
                  <a
                    href={mentor.calendarLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
                  >
                    Book chemistry session
                  </a>
                )}
            </div>
          </div>
        </div>

        {mentor.email && (
          <div className="mt-6 text-left">
            <p className="font-sans text-sm font-normal text-muted">
              Reach {mentor.fullName.trim().split(/\s+/)[0]}
            </p>

            <a
              href={`mailto:${mentor.email}`}
              className="font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
            >
              Email
            </a>
          </div>
        )}

        <div className="my-6 h-px w-full bg-line" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {(subStatus === "booked" || subStatus === "confirmed-waiting") &&
              countdown.daysLeft !== null && (
                <p className="font-sans text-sm font-normal text-muted">
                  {countdown.daysLeft}{" "}
                  {countdown.daysLeft === 1 ? "day" : "days"} left
                </p>
              )}

            {subStatus === "booked" && (
              <p className="mt-1 font-sans text-sm font-normal text-muted">
                Chemistry session booked
              </p>
            )}

            {subStatus === "confirmed-waiting" && (
              <p className="mt-1 font-sans text-sm font-normal text-muted">
                Your confirmation has been recorded. Waiting for your mentor.
              </p>
            )}

            {subStatus === "active" && (
              <p className="mt-1 font-sans text-sm font-bold text-ok">
                Your mentorship is active.
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            {renderPrimaryAction()}

            {showDecline && (
              <Button
                variant="outline"
                onClick={() => void onDecline(currentMatch.id)}
                disabled={isActionPending}
              >
                {pendingAction === "decline" ? "Declining..." : "Decline"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {canViewMoreRecommendations && (
        <div className="border-t border-line pt-6">
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => void handleViewMoreRecommendations()}
              disabled={isLoadingRecommendations}
            >
              {isLoadingRecommendations
                ? "Finding more mentors..."
                : showMoreRecommendations
                  ? "Hide recommendations"
                  : "View more recommendations"}
            </Button>
          </div>

          {recommendationsError && (
            <div
              role="alert"
              className="mt-5 rounded-lg border-l-4 border-error bg-error-tint px-4 py-3"
            >
              <p className="font-sans text-sm font-normal text-error">
                {recommendationsError}
              </p>
            </div>
          )}

          {showMoreRecommendations && (
            <div className="mt-8">
              {recommendations.length === 0 ? (
                <p className="mt-6 font-sans text-sm font-normal text-muted">
                  There are no other suitable mentors available right now.
                </p>
              ) : (
                <>
                  <div>
                    <h3 className="font-display text-xl font-black text-fg">
                      Other strong matches
                    </h3>

                    <p className="mt-2 font-sans text-sm font-normal text-muted">
                      These are the next highest-ranked mentors based on your
                      goals, availability and preferences.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {recommendations.map((recommendation, index) => (
                      <article
                        key={recommendation.mentorId}
                        className="rounded-[10px] border border-line bg-bg p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-sans text-xs font-bold uppercase tracking-wide text-accent">
                              Recommendation #{index + 2}
                            </p>

                            <h4 className="mt-1 font-display text-lg font-black text-fg">
                              {recommendation.profile.fullName}
                            </h4>

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
                          <p className="mt-4 font-sans text-sm font-normal leading-6 text-fg">
                            {recommendation.profile.bio}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-sans text-sm font-normal text-muted">
                          {recommendation.profile.region && (
                            <span>
                              {recommendation.profile.region.replaceAll(
                                "_",
                                " ",
                              )}
                            </span>
                          )}

                          {recommendation.profile.openToRemote && (
                            <span>Open to remote</span>
                          )}
                        </div>

                        {recommendation.profile.linkedinURL && (
                          <div className="mt-5">
                            <a
                              href={recommendation.profile.linkedinURL}
                              target="_blank"
                              rel="noreferrer"
                              className="font-sans text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
                            >
                              View LinkedIn
                            </a>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </>
              )}

              {recommendations.length > 0 && (
                <p className="mt-5 font-sans text-xs font-normal text-muted">
                  Your current proposal remains unchanged while you view these
                  alternatives.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import type {
  MentorDashboardEngagement,
  MentorEngagementStatus,
} from "@/services/mentorDashboardService";

import { Thread } from "../ui/Thread";
import { StatusBadge } from "../ui/StatusBadge";
import { Button } from "../ui/Button";

type PendingAction = "accept" | "check-in" | "decline" | "end" | null;

interface MentorMenteeCardProps {
  engagement: MentorDashboardEngagement;

  mentorName: string;

  onAccept: (engagementId: string) => void;

  onCheckIn: (engagementId: string, agreed: boolean) => void;

  onDecline: (engagementId: string) => void;

  onEnd: (engagementId: string) => void;

  pendingAction: PendingAction;
}

interface StatusPresentation {
  badgeLabel: string;

  badgeVariant: "proposed" | "accepted" | "active" | "closed";
}

function getStatusPresentation(
  status: MentorEngagementStatus,
): StatusPresentation {
  switch (status) {
    case "proposed-awaiting-acceptance":
      return {
        badgeLabel: "Chemistry proposal",
        badgeVariant: "proposed",
      };

    case "awaiting-booking":
      return {
        badgeLabel: "Chemistry accepted",
        badgeVariant: "accepted",
      };

    case "booked":
      return {
        badgeLabel: "Session booked",
        badgeVariant: "accepted",
      };

    case "confirmed-waiting":
      return {
        badgeLabel: "Final check-in",
        badgeVariant: "accepted",
      };

    case "active":
      return {
        badgeLabel: "Active",
        badgeVariant: "active",
      };
  }
}

export function MentorMenteeCard({
  engagement,
  mentorName,
  onAccept,
  onCheckIn,
  onDecline,
  onEnd,
  pendingAction,
}: MentorMenteeCardProps) {
  const { mentee, countdown, checkIn, scheduledCheckIn } = engagement;

  const presentation = getStatusPresentation(engagement.subStatus);

  const isPending = pendingAction !== null;

  /*
   * Public profile information helps a mentor
   * decide whether to accept a chemistry proposal.
   *
   * Private email remains hidden until acceptance.
   */
  const canRevealEmail = engagement.status !== "CHEMISTRY_PENDING";

  const canDecline =
    engagement.status === "CHEMISTRY_PENDING" ||
    engagement.status === "CHEMISTRY_CONFIRMED";

  function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
    }).format(new Date(value));
  }

  function getLinkedInUrl(linkedinURL: string): string {
    if (
      linkedinURL.startsWith("http://") ||
      linkedinURL.startsWith("https://")
    ) {
      return linkedinURL;
    }

    return `https://${linkedinURL}`;
  }

  function renderStateMessage() {
    switch (engagement.subStatus) {
      case "proposed-awaiting-acceptance":
        return (
          <>
            <p className="text-sm text-muted">
              {mentee.fullName} has proposed a chemistry session with you.
            </p>

            {countdown.daysLeft !== null && (
              <p className="mt-1 text-sm text-muted">
                Please respond within {countdown.daysLeft}{" "}
                {countdown.daysLeft === 1 ? "day" : "days"}.
              </p>
            )}
          </>
        );

      case "awaiting-booking":
        return (
          <>
            <p className="text-sm text-muted">
              You accepted the chemistry proposal. You can now contact{" "}
              {mentee.fullName} and arrange the session.
            </p>

            {scheduledCheckIn && (
              <p className="mt-1 text-sm text-muted">
                We will ask both of you whether you want to continue on{" "}
                {formatDate(scheduledCheckIn)}.
              </p>
            )}
          </>
        );

      case "booked":
        return (
          <>
            <p className="text-sm text-muted">
              {mentee.fullName} has marked the chemistry session as booked.
            </p>

            {scheduledCheckIn && (
              <p className="mt-1 text-sm text-muted">
                Your final check-in is scheduled for{" "}
                {formatDate(scheduledCheckIn)}.
              </p>
            )}
          </>
        );

      case "confirmed-waiting":
        if (checkIn.mentorAgreed === true) {
          return (
            <>
              <p className="text-sm text-muted">
                Your response has been recorded. We are waiting for{" "}
                {mentee.fullName}'s response.
              </p>

              {countdown.daysLeft !== null && (
                <p className="mt-1 text-sm text-muted">
                  {countdown.daysLeft}{" "}
                  {countdown.daysLeft === 1 ? "day" : "days"} left in the
                  confirmation window.
                </p>
              )}
            </>
          );
        }

        return (
          <>
            <p className="text-sm text-muted">
              Would you like to continue mentoring {mentee.fullName}?
            </p>

            {checkIn.menteeAgreed === true && (
              <p className="mt-1 text-sm text-muted">
                {mentee.fullName} has already said yes.
              </p>
            )}

            {countdown.daysLeft !== null && (
              <p className="mt-1 text-sm text-muted">
                Please respond within {countdown.daysLeft}{" "}
                {countdown.daysLeft === 1 ? "day" : "days"}.
              </p>
            )}
          </>
        );

      case "active":
        return (
          <p className="text-sm font-bold text-ok">
            Your mentorship with {mentee.fullName} is active.
          </p>
        );
    }
  }

  function renderPrimaryAction() {
    switch (engagement.subStatus) {
      case "proposed-awaiting-acceptance":
        return (
          <Button disabled={isPending} onClick={() => onAccept(engagement.id)}>
            {pendingAction === "accept"
              ? "Accepting..."
              : "Accept chemistry proposal"}
          </Button>
        );

      case "awaiting-booking":
      case "booked":
        return null;

      case "confirmed-waiting":
        if (checkIn.mentorAgreed !== null) {
          return null;
        }

        return (
          <>
            <p className="mb-2 text-sm text-muted">
              If the chemistry session did not happen within the last seven
              days, please select “No, do not continue”.
            </p>

            <Button
              disabled={isPending}
              onClick={() => onCheckIn(engagement.id, true)}
            >
              {pendingAction === "check-in"
                ? "Saving..."
                : "Yes, continue mentorship"}
            </Button>

            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onCheckIn(engagement.id, false)}
            >
              No, do not continue
            </Button>
          </>
        );

      case "active":
        return (
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onEnd(engagement.id)}
          >
            {pendingAction === "end" ? "Ending..." : "End Mentorship"}
          </Button>
        );
    }
  }

  return (
    <article className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-start sm:gap-5">
        <div className="text-left sm:text-right">
          <p className="font-display text-xl font-black text-fg">You</p>

          <p className="mt-1 text-xs text-muted">{mentorName}</p>
        </div>

        <div className="flex flex-col items-center">
          <Thread className="h-9 w-28 sm:h-10 sm:w-40" />

          <StatusBadge variant={presentation.badgeVariant}>
            {presentation.badgeLabel}
          </StatusBadge>
        </div>

        <div className="min-w-0">
          <p className="font-display text-xl font-black text-fg">
            {mentee.fullName}
          </p>

          {mentee.currentJobTitle && (
            <p className="mt-1 font-sans text-sm font-normal text-muted">
              {mentee.currentJobTitle}
            </p>
          )}

          {mentee.bio && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                About {mentee.fullName.trim().split(/\s+/)[0]}
              </p>

              <p className="mt-2 max-w-xl font-sans text-sm font-normal leading-6 text-fg">
                {mentee.bio}
              </p>
            </div>
          )}

          {mentee.reasonsNote && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                What they want from mentoring
              </p>

              <p className="mt-2 max-w-xl font-sans text-sm font-normal leading-6 text-fg">
                {mentee.reasonsNote}
              </p>
            </div>
          )}

          {mentee.goals.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Goals
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {mentee.goals.map((goal) => (
                  <span
                    key={goal}
                    className="rounded-full border border-line bg-bg px-3 py-1 font-sans text-xs font-bold text-fg"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mentee.linkedinURL && (
            <div className="mt-5">
              <a
                href={getLinkedInUrl(mentee.linkedinURL)}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
              >
                View LinkedIn profile
              </a>
            </div>
          )}
        </div>
      </div>

      {canRevealEmail && mentee.email && (
        <>
          <div className="my-5 h-px bg-line" />

          <div>
            <p className="text-xs font-semibold uppercase text-muted">
              Reach {mentee.fullName.trim().split(/\s+/)[0]}
            </p>

            <a
              href={`mailto:${mentee.email}`}
              className="mt-1 inline-block text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
            >
              {mentee.email}
            </a>
          </div>
        </>
      )}

      <div className="my-5 h-px bg-line" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">{renderStateMessage()}</div>

        <div className="flex flex-wrap gap-2">
          {renderPrimaryAction()}

          {canDecline && (
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onDecline(engagement.id)}
            >
              {pendingAction === "decline"
                ? "Declining..."
                : engagement.status === "CHEMISTRY_PENDING"
                  ? "Decline proposal"
                  : "Decline"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

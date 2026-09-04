import { Thread } from "../Thread";
import { Button } from "../Button";

import type { MenteeDashboardCurrentMatch } from "@/services/menteeDashboardService";

type PendingAction = "book" | "check-in" | "decline" | "end";

interface AfterMatchProposedProps {
  currentMatch: MenteeDashboardCurrentMatch;

  menteeName: string;

  onBook: (matchId: string) => void | Promise<void>;

  onCheckIn: (matchId: string, agreed: boolean) => void | Promise<void>;

  onDecline: (matchId: string) => void | Promise<void>;

  onEnd: (matchId: string) => void | Promise<void>;

  pendingAction: PendingAction | null;
}

export function AfterMatchProposed({
  currentMatch,
  menteeName,
  onBook,
  onCheckIn,
  onDecline,
  onEnd,
  pendingAction,
}: AfterMatchProposedProps) {
  const { mentor, subStatus, countdown, checkIn, scheduledCheckIn } =
    currentMatch;

  const isActionPending = pendingAction !== null;

  const canRevealContactDetails = currentMatch.status !== "CHEMISTRY_PENDING";

  const canDecline =
    currentMatch.status === "CHEMISTRY_PENDING" ||
    currentMatch.status === "CHEMISTRY_CONFIRMED";

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

  function renderStatus() {
    switch (subStatus) {
      case "proposed":
        return (
          <div className="rounded-full bg-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-accent">
              Awaiting mentor
            </p>
          </div>
        );

      case "awaiting-booking":
        return (
          <div className="rounded-full bg-warn-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-warn">
              Chemistry confirmed
            </p>
          </div>
        );

      case "booked":
        return (
          <div className="rounded-full bg-warn-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-warn">
              Session booked
            </p>
          </div>
        );

      case "confirmed-waiting":
        return (
          <div className="rounded-full bg-warn-tint px-4 py-2 text-center">
            <p className="font-sans text-xs font-bold text-warn">
              Final check-in
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

  function renderStateMessage() {
    switch (subStatus) {
      case "proposed":
        return (
          <>
            <p className="font-sans text-sm font-normal text-muted">
              Your chemistry proposal has been sent to {mentor.fullName}. We
              will let you know when they respond.
            </p>

            {countdown.daysLeft !== null && (
              <p className="mt-1 font-sans text-sm font-normal text-muted">
                {countdown.daysLeft} {countdown.daysLeft === 1 ? "day" : "days"}{" "}
                remaining for the proposal.
              </p>
            )}
          </>
        );

      case "awaiting-booking":
        return (
          <>
            <p className="font-sans text-sm font-normal text-muted">
              {mentor.fullName} accepted your chemistry proposal. Arrange your
              chemistry session using the contact details above.
            </p>

            <p className="mt-2 font-sans text-sm font-normal text-muted">
              Marking the session as booked is optional. Your scheduled check-in
              will still happen if you do not.
            </p>

            {scheduledCheckIn && (
              <p className="mt-1 font-sans text-sm font-normal text-muted">
                We will check in with both of you on{" "}
                {formatDate(scheduledCheckIn)}.
              </p>
            )}
          </>
        );

      case "booked":
        return (
          <>
            <p className="font-sans text-sm font-normal text-muted">
              You have marked your chemistry session as booked.
            </p>

            {scheduledCheckIn && (
              <p className="mt-1 font-sans text-sm font-normal text-muted">
                We will ask both of you whether you want to continue on{" "}
                {formatDate(scheduledCheckIn)}.
              </p>
            )}
          </>
        );

      case "confirmed-waiting":
        if (checkIn.menteeAgreed === true) {
          return (
            <>
              <p className="font-sans text-sm font-normal text-muted">
                Your response has been recorded. We are waiting for your
                mentor's response.
              </p>

              {countdown.daysLeft !== null && (
                <p className="mt-1 font-sans text-sm font-normal text-muted">
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
            <p className="font-sans text-sm font-normal text-muted">
              Would you like to continue with {mentor.fullName} as your mentor?
            </p>

            <p className="mt-2 font-sans text-sm font-normal text-muted">
              If the chemistry session did not happen within the last seven
              days, please select “No, rematch me”.
            </p>

            {countdown.daysLeft !== null && (
              <p className="mt-1 font-sans text-sm font-normal text-muted">
                Please respond within {countdown.daysLeft}{" "}
                {countdown.daysLeft === 1 ? "day" : "days"}.
              </p>
            )}
          </>
        );

      case "active":
        return (
          <p className="font-sans text-sm font-bold text-ok">
            Your mentorship with {mentor.fullName} is active.
          </p>
        );
    }
  }

  function renderPrimaryAction() {
    switch (subStatus) {
      case "proposed":
        return null;

      case "awaiting-booking":
        return (
          <Button
            className="bg-accent text-on-accent hover:bg-accent-hover"
            onClick={() => void onBook(currentMatch.id)}
            disabled={isActionPending}
          >
            {pendingAction === "book" ? "Saving..." : "Mark as booked"}
          </Button>
        );

      case "booked":
        return null;

      case "confirmed-waiting":
        if (checkIn.menteeAgreed !== null) {
          return null;
        }

        return (
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-accent text-on-accent hover:bg-accent-hover"
              onClick={() => void onCheckIn(currentMatch.id, true)}
              disabled={isActionPending}
            >
              {pendingAction === "check-in"
                ? "Saving..."
                : "Yes, continue mentorship"}
            </Button>

            <Button
              variant="outline"
              onClick={() => void onCheckIn(currentMatch.id, false)}
              disabled={isActionPending}
            >
              No, rematch me
            </Button>
          </div>
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

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="text-left sm:w-[40%] sm:text-right">
          <p className="font-display text-[20px] font-black text-fg">You</p>

          <p className="mt-1 text-xs text-muted">{menteeName}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 sm:w-[20%]">
          <Thread />

          {renderStatus()}
        </div>

        <div className="sm:w-[40%]">
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
            <p className="mt-2 font-sans text-sm font-normal text-muted">
              {mentor.focusAreas.join(" · ")}
            </p>
          )}

          {canRevealContactDetails && mentor.linkedinURL && (
            <a
              href={getLinkedInUrl(mentor.linkedinURL)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-sans text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
            >
              View LinkedIn profile
            </a>
          )}
        </div>
      </div>

      {canRevealContactDetails && (mentor.calendarLink || mentor.email) && (
        <div className="mt-6 rounded-[10px] border border-line bg-bg p-5">
          <p className="font-sans text-sm font-bold text-fg">
            Contact {mentor.fullName}
          </p>

          <div className="mt-3 flex flex-wrap gap-4">
            {mentor.calendarLink && (
              <a
                href={mentor.calendarLink}
                target="_blank"
                rel="noreferrer"
                className="font-sans text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
              >
                Schedule meeting
              </a>
            )}

            {mentor.email && (
              <a
                href={`mailto:${mentor.email}`}
                className="font-sans text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
              >
                Email mentor
              </a>
            )}
          </div>
        </div>
      )}

      <div className="my-6 h-px w-full bg-line" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">{renderStateMessage()}</div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3">
          {renderPrimaryAction()}

          {canDecline && (
            <Button
              variant="outline"
              onClick={() => void onDecline(currentMatch.id)}
              disabled={isActionPending}
            >
              {pendingAction === "decline"
                ? "Declining..."
                : "Decline and rematch"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

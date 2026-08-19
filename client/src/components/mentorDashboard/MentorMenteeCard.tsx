import type {
  MentorDashboardEngagement,
  MentorEngagementStatus,
} from "@/services/mentorDashboardService";

import { Thread } from "../ui/Thread";
import { StatusBadge } from "../ui/StatusBadge";
import { Button } from "../ui/Button";

type PendingAction = "confirm" | "decline" | "end" | null;
interface MentorMenteeCardProps {
  engagement: MentorDashboardEngagement;
  mentorName: string;

  onConfirm: (engagementId: string) => void;
  onDecline: (engagementId: string) => void;
  onEnd: (engagementId: string) => void;

  pendingAction: PendingAction;
}

interface StatusPresentation {
  badgeLabel: string;
  badgeVariant: "proposed" | "accepted" | "active" | "closed";
  message: string;
  showEmail: boolean;
  showConfirm: boolean;
  showDecline: boolean;
  showEnd: boolean;
}
function getStatusPresentation(
  status: MentorEngagementStatus,
  menteeName: string,
): StatusPresentation {
  switch (status) {
    case "proposed-awaiting-acceptance":
      return {
        badgeLabel: "Awaiting acceptance",
        badgeVariant: "proposed",
        message: `Waiting for ${menteeName} to accept.`,
        showEmail: false,
        showConfirm: false,
        showDecline: true,
        showEnd: false,
      };

    case "awaiting-booking":
      return {
        badgeLabel: "Chemistry & confirm",
        badgeVariant: "accepted",
        message: `Waiting for the mentee to book the chemistry session.`,
        showEmail: true,
        showConfirm: false,
        showDecline: true,
        showEnd: false,
      };

    case "booked":
      return {
        badgeLabel: "Chemistry & confirm",
        badgeVariant: "accepted",
        message: `Chemistry session booked — confirm after you meet.`,
        showEmail: true,
        showConfirm: true,
        showDecline: true,
        showEnd: false,
      };

    case "confirmed-waiting":
      return {
        badgeLabel: "Chemistry & confirm",
        badgeVariant: "accepted",
        message: `Confirmed — waiting for ${menteeName}.`,
        showEmail: true,
        showConfirm: false,
        showDecline: true,
        showEnd: false,
      };

    case "active":
      return {
        badgeLabel: "Active",
        badgeVariant: "active",
        message: `Mentorship active.`,
        showEmail: true,
        showConfirm: false,
        showDecline: false,
        showEnd: true,
      };
  }
}

export function MentorMenteeCard({
  engagement,
  mentorName,
  onConfirm,
  onDecline,
  onEnd,
  pendingAction,
}: MentorMenteeCardProps) {
  const { mentee, countdown } = engagement;

  const presentation = getStatusPresentation(
    engagement.subStatus,
    mentee.fullName,
  );

  const isPending = pendingAction !== null;

  return (
    <article className="rounded-lg border border-line bg-surface p-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="text-right">
          <p className="font-display text-xl font-semibold text-fg">You</p>

          <p className="mt-1 text-xs text-muted">{mentorName}</p>
        </div>

        <div className="flex flex-col items-center">
          <Thread className="h-10 w-32 sm:w-48" />

          <StatusBadge variant={presentation.badgeVariant}>
            {presentation.badgeLabel}
          </StatusBadge>
        </div>

        <div>
          <p className="font-display text-xl font-black text-fg">
            {mentee.fullName}
          </p>

          {mentee.currentJobTitle && (
            <p className="mt-1 font-sans text-sm font-normal text-muted">
              {mentee.currentJobTitle}
            </p>
          )}

          {mentee.bio && (
            <p className="mt-3 max-w-xl font-sans text-sm font-normal leading-6 text-fg">
              {mentee.bio}
            </p>
          )}

          {mentee.focus && (
            <p className="mt-2 font-sans text-sm font-normal text-muted">
              {mentee.focus}
            </p>
          )}

          {mentee.linkedinURL && (
            <a
              href={
                mentee.linkedinURL.startsWith("http://") ||
                mentee.linkedinURL.startsWith("https://")
                  ? mentee.linkedinURL
                  : `https://${mentee.linkedinURL}`
              }
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-bold text-accent underline decoration-accent-soft underline-offset-4 hover:text-accent-hover"
            >
              View LinkedIn profile
            </a>
          )}
        </div>
      </div>

      {presentation.showEmail && mentee.email && (
        <>
          <div className="my-5 h-px bg-line" />
          <div>
            <p className="text-xs font-semibold uppercase text-muted">
              Reach {mentee.fullName.trim().split(/\s+/)[0]}
            </p>

            <a
              href={`mailto:${mentee.email}`}
              className="mt-1 inline-block text-sm text-accent underline"
            >
              Email
            </a>
          </div>
        </>
      )}

      <div className="my-5 h-px bg-line" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {(engagement.subStatus === "booked" ||
            engagement.subStatus === "confirmed-waiting") &&
            countdown.daysLeft !== null && (
              <p className="mt-1 text-sm font-normal text-muted">
                {countdown.daysLeft} {countdown.daysLeft === 1 ? "day" : "days"}{" "}
                left
              </p>
            )}

          <p className="mt-1 text-sm text-muted">{presentation.message}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {presentation.showConfirm && (
            <Button
              disabled={isPending}
              onClick={() => onConfirm(engagement.id)}
            >
              {pendingAction === "confirm"
                ? "Confirming..."
                : "Confirm Mentorship"}
            </Button>
          )}
          {presentation.showDecline && (
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onDecline(engagement.id)}
            >
              {pendingAction === "decline" ? "Declining..." : "Decline"}
            </Button>
          )}
          {presentation.showEnd && (
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onEnd(engagement.id)}
            >
              {pendingAction === "end" ? "Ending..." : "End Mentorship"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

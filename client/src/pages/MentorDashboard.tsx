import { useEffect, useState } from "react";

import { AcceptingMenteesToggle } from "@/components/ui/AcceptingMenteesToggle";
import { Header } from "@/components/Header";
import { MentorCapacityCard } from "@/components/mentorDashboard/MentorCapacityCard";
import { MentorEmptyState } from "@/components/mentorDashboard/MentorEmptyState";
import { MentorMenteeCard } from "@/components/mentorDashboard/MentorMenteeCard";
import { MentorProfileSummary } from "@/components/mentorDashboard/MentorProfileSummary";
import { MentorStatusBadge } from "@/components/ui/MentorApprovalBadge";

import { useAuth } from "@/lib/context/useAuth";

import { getApiErrorMessage } from "@/services/getApiErrorMessages";

import {
  acceptMentorChemistry,
  declineMentorEngagement,
  endMentorEngagement,
  getMentorDashboard,
  respondToMentorCheckIn,
  type MentorDashboardResponse,
} from "@/services/mentorDashboardService";

import { isMentorProfileResponse } from "@/services/mentorService";

type PendingAction = "accept" | "check-in" | "decline" | "end";

export function MentorDashboard() {
  const { profile, isLoading } = useAuth();

  const mentorProfile = isMentorProfileResponse(profile) ? profile : null;

  const [dashboard, setDashboard] = useState<MentorDashboardResponse | null>(
    null,
  );

  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<{
    engagementId: string;
    action: PendingAction;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        setDashboardError(null);

        const data = await getMentorDashboard();

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (error) {
        if (!cancelled) {
          setDashboardError(
            getApiErrorMessage(error, "Unable to load your mentor dashboard."),
          );
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    }

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshDashboard() {
    try {
      setDashboardError(null);

      const data = await getMentorDashboard();

      setDashboard(data);
    } catch (error) {
      setDashboardError(
        getApiErrorMessage(error, "Unable to refresh your mentor dashboard."),
      );
    }
  }

  async function handleAccept(engagementId: string) {
    if (pendingAction) {
      return;
    }

    try {
      setPendingAction({
        engagementId,
        action: "accept",
      });

      setDashboardError(null);

      await acceptMentorChemistry(engagementId);

      await refreshDashboard();
    } catch (error) {
      setDashboardError(
        getApiErrorMessage(
          error,
          "Unable to accept this chemistry proposal. Please try again.",
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDecline(engagementId: string) {
    if (pendingAction) {
      return;
    }

    try {
      setPendingAction({
        engagementId,
        action: "decline",
      });

      setDashboardError(null);

      await declineMentorEngagement(engagementId);

      await refreshDashboard();
    } catch (error) {
      setDashboardError(
        getApiErrorMessage(
          error,
          "Unable to decline this mentorship. Please try again.",
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCheckIn(engagementId: string, agreed: boolean) {
    if (pendingAction) {
      return;
    }

    try {
      setPendingAction({
        engagementId,
        action: "check-in",
      });

      setDashboardError(null);

      await respondToMentorCheckIn(engagementId, agreed);

      await refreshDashboard();
    } catch (error) {
      setDashboardError(
        getApiErrorMessage(
          error,
          "Unable to save your mentorship response. Please try again.",
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleEnd(engagementId: string) {
    if (pendingAction) {
      return;
    }

    try {
      setPendingAction({
        engagementId,
        action: "end",
      });

      setDashboardError(null);

      await endMentorEngagement(engagementId);

      await refreshDashboard();
    } catch (error) {
      setDashboardError(
        getApiErrorMessage(
          error,
          "Unable to end this mentorship. Please try again.",
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading || dashboardLoading) {
    return (
      <>
        <Header />

        <main className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-muted">Loading dashboard...</p>
        </main>
      </>
    );
  }

  if (!mentorProfile) {
    return (
      <>
        <Header />

        <main className="mx-auto max-w-6xl px-4 py-8">
          <p role="alert" className="text-error">
            Unable to load your mentor profile.
          </p>
        </main>
      </>
    );
  }

  if (dashboardError || !dashboard) {
    return (
      <>
        <Header />

        <main className="mx-auto max-w-6xl px-4 py-8">
          <p role="alert" className="text-error">
            {dashboardError ?? "Unable to load your mentor dashboard."}
          </p>
        </main>
      </>
    );
  }

  const fullName = mentorProfile.user?.fullName ?? "Mentor";

  const firstName = fullName.trim().split(/\s+/)[0];

  const engagements = dashboard.engagements;

  const disciplines = mentorProfile.disciplines?.length
    ? mentorProfile.disciplines
    : (mentorProfile.mentorDisciplines
        ?.map((item) => item.discipline?.name ?? item.name ?? item.disciplineId)
        .filter((name): name is string => Boolean(name)) ?? []);

  return (
    <div>
      <Header />

      <main>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h1 className="overshoot font-display text-[36px] font-black">
                Your mentees
              </h1>

              <p className="mt-4 font-sans font-normal text-muted">
                Thank you, {firstName} — every line below is a career you're
                helping along.
              </p>

              <div className="mt-4">
                <MentorStatusBadge />
              </div>

              <div className="mt-6">
                <AcceptingMenteesToggle />
              </div>
            </div>

            <MentorCapacityCard
              filled={dashboard.capacity.filled}
              total={dashboard.capacity.total}
            />
          </section>

          {dashboardError && (
            <div
              role="alert"
              className="mt-6 rounded-lg border-l-4 border-error bg-error-tint px-4 py-3"
            >
              <p className="text-sm text-error">{dashboardError}</p>
            </div>
          )}

          {engagements.length === 0 ? (
            <MentorEmptyState
              isAcceptingMentees={dashboard.isAcceptingMentees}
            />
          ) : (
            <div className="mx-auto max-w-6xl space-y-6 py-8">
              {engagements.map((engagement) => (
                <MentorMenteeCard
                  key={engagement.id}
                  engagement={engagement}
                  mentorName={fullName}
                  onAccept={handleAccept}
                  onCheckIn={handleCheckIn}
                  onDecline={handleDecline}
                  onEnd={handleEnd}
                  pendingAction={
                    pendingAction?.engagementId === engagement.id
                      ? pendingAction.action
                      : null
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-6">
            <MentorProfileSummary
              disciplines={disciplines}
              bio={mentorProfile.bio}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/context/useAuth";

import {
  getMentorDashboard,
  declineMentorEngagement,
  confirmMentorEngagement,
  endMentorEngagement,
  type MentorDashboardResponse,
} from "@/services/mentorDashboardService";

import { Header } from "@/components/Header";
import { MentorCapacityCard } from "@/components/mentorDashboard/MentorCapacityCard";
import { MentorEmptyState } from "@/components/mentorDashboard/MentorEmptyState";
import { MentorProfileSummary } from "@/components/mentorDashboard/MentorProfileSummary";
import { AcceptingMenteesToggle } from "@/components/ui/AcceptingMenteesToggle";
import { MentorMenteeCard } from "@/components/mentorDashboard/MentorMenteeCard";
import { isMentorProfileResponse } from "@/services/mentorService";
// import { MentorStatusBadge } from "@/components/ui/MentorApprovalBadge";

export function MentorDashboard() {
  type PendingAction = "confirm" | "decline" | "end";

  const { profile, isLoading } = useAuth();
  const mentorProfile = isMentorProfileResponse(profile) ? profile : null;

  const [dashboard, setDashboard] = useState<MentorDashboardResponse | null>(
    null,
  );

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  // Track which engagement is running and prevents double-submit by confirming..., declining..., or ending...
  const [pendingAction, setPendingAction] = useState<{
    engagementId: string;
    action: PendingAction;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Initial dashboard fetch
    async function fetchDashboard() {
      try {
        const data = await getMentorDashboard();

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (error) {
        console.error("Failed to load mentor dashboard:", error);

        if (!cancelled) {
          setDashboardError("Unable to load your mentor dashboard.");
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

  // We just refresh the latest dashboard state and not load entire page
  async function refreshDashboard() {
    try {
      setDashboardError(null);

      const data = await getMentorDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Failed to refresh mentor dashboard:", error);
      setDashboardError("Unable to refresh your mentor dashboard.");
    }
  }

  async function handleDecline(engagementId: string) {
    if (pendingAction) return;

    try {
      setPendingAction({
        engagementId,
        action: "decline",
      });

      await declineMentorEngagement(engagementId);
      await refreshDashboard();
    } catch (error) {
      console.error("Failed to decline engagement:", error);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleConfirm(engagementId: string) {
    if (pendingAction) return;

    try {
      setPendingAction({
        engagementId,
        action: "confirm",
      });

      await confirmMentorEngagement(engagementId);
      await refreshDashboard();
    } catch (error) {
      console.error("Failed to confirm engagement:", error);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleEnd(engagementId: string) {
    // Prevent a second action while one is already running.
    if (pendingAction) return;

    try {
      setPendingAction({
        engagementId,
        action: "end",
      });

      await endMentorEngagement(engagementId);
      // Re-fetch capacity and engagements instead of changing them locally.
      await refreshDashboard();
    } catch (error) {
      console.error("Failed to end engagement:", error);
    } finally {
      setPendingAction(null);
    }
  }

  // Wait until both the existing profile and the new dashboard data load.
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

  // Existing mentor profile failed / does not exist.
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

  // New mentor dashboard request failed.
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

  // PROFILE owns mentor identity/profile data.
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
              <h1 className="overshoot font-display font-semibold text-[36px]">
                Your mentees
              </h1>

              <p className="mt-4 text-muted">
                Thank you, {firstName} — every line below is a career you're
                helping along.
              </p>
              {/* <div className="mt-4">
              <MentorStatusBadge />
            </div> */}

              <div className="mt-6">
                <AcceptingMenteesToggle />
              </div>
            </div>

            {/* Dynamic capacity comes from dashboard endpoint */}
            <MentorCapacityCard
              filled={dashboard.capacity.filled}
              total={dashboard.capacity.total}
            />
          </section>

          {/* show empty state if no engagement */}
          {engagements.length === 0 ? (
            <MentorEmptyState
              isAcceptingMentees={dashboard.isAcceptingMentees}
            />
          ) : (
            <div className="mx-auto max-w-6xl py-8">
              {engagements.map((engagement) => (
                <MentorMenteeCard
                  key={engagement.id}
                  engagement={engagement}
                  mentorName={fullName}
                  onDecline={handleDecline}
                  onConfirm={handleConfirm}
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
